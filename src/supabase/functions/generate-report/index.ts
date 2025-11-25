import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { reportType, periodStart, periodEnd } = await req.json();

    console.log('Generating report:', { reportType, periodStart, periodEnd });

    // Fetch houses data for the period
    const { data: houses, error: housesError } = await supabase
      .from('houses')
      .select('*')
      .gte('created_at', periodStart)
      .lte('created_at', periodEnd);

    if (housesError) {
      console.error('Error fetching houses:', housesError);
      throw housesError;
    }

    // Fetch all users count
    const { count: usersCount, error: usersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (usersError) {
      console.error('Error counting users:', usersError);
      throw usersError;
    }

    // Generate report data based on type
    let reportData: any = {};

    if (reportType === 'general') {
      // Calculate statistics
      const totalHouses = houses?.length || 0;
      const statusDistribution = houses?.reduce((acc: any, house: any) => {
        acc[house.status || 'pending'] = (acc[house.status || 'pending'] || 0) + 1;
        return acc;
      }, {});

      const propertyTypeDistribution = houses?.reduce((acc: any, house: any) => {
        acc[house.property_type] = (acc[house.property_type] || 0) + 1;
        return acc;
      }, {});

      const cityDistribution = houses?.reduce((acc: any, house: any) => {
        acc[house.city] = (acc[house.city] || 0) + 1;
        return acc;
      }, {});

      // Sensitive objects analysis
      const sensitiveObjectsCount: any = {};
      houses?.forEach((house: any) => {
        if (house.sensitive_objects && Array.isArray(house.sensitive_objects)) {
          house.sensitive_objects.forEach((obj: string) => {
            sensitiveObjectsCount[obj] = (sensitiveObjectsCount[obj] || 0) + 1;
          });
        }
      });

      // Plan analysis statistics
      const housesWithPlans = houses?.filter((h: any) => h.plan_url).length || 0;
      const housesWithAnalysis = houses?.filter((h: any) => h.plan_analysis).length || 0;
      
      // Risk level distribution
      const riskLevels = houses
        ?.filter((h: any) => h.plan_analysis)
        .map((h: any) => h.plan_analysis?.overallRisk)
        .filter(Boolean);
      
      const riskDistribution = riskLevels?.reduce((acc: any, risk: string) => {
        acc[risk] = (acc[risk] || 0) + 1;
        return acc;
      }, {});

      reportData = {
        summary: {
          totalHouses,
          totalUsers: usersCount || 0,
          housesWithPlans,
          housesWithAnalysis,
          periodStart,
          periodEnd
        },
        distributions: {
          status: statusDistribution,
          propertyType: propertyTypeDistribution,
          city: cityDistribution,
          riskLevel: riskDistribution
        },
        sensitiveObjects: Object.entries(sensitiveObjectsCount)
          .map(([name, count]) => ({ name, count }))
          .sort((a: any, b: any) => b.count - a.count)
          .slice(0, 10),
        trends: {
          averageRoomsPerHouse: houses?.length 
            ? houses.reduce((acc: number, h: any) => acc + (h.number_of_rooms || 0), 0) / houses.length
            : 0,
          averageSurfaceArea: houses?.length
            ? houses.reduce((acc: number, h: any) => acc + (parseFloat(h.surface_area) || 0), 0) / houses.length
            : 0
        }
      };
    }

    // Save report to database
    const { data: report, error: saveError } = await supabase
      .from('reports')
      .insert({
        report_type: reportType,
        report_data: reportData,
        period_start: periodStart,
        period_end: periodEnd
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving report:', saveError);
      throw saveError;
    }

    console.log('Report generated successfully:', report.id);

    return new Response(
      JSON.stringify({ success: true, report }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-report function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});