// Mock data for administrative section
// Login credentials: admin / admin123

export const mockUsers = [
  {
    userId: "550e8400-e29b-41d4-a716-446655440001",
    userName: "Sophie Martin",
    email: "sophie.martin@email.fr",
    role: "user",
  },
  {
    userId: "550e8400-e29b-41d4-a716-446655440002",
    userName: "Jean Dupont",
    email: "jean.dupont@email.fr",
    role: "user",
  },
  {
    userId: "550e8400-e29b-41d4-a716-446655440003",
    userName: "Marie Laurent",
    email: "marie.laurent@email.fr",
    role: "user",
  },
];

export const mockHousesWithAnalysis = [
  {
    userId: "550e8400-e29b-41d4-a716-446655440001",
    userName: "Sophie Martin",
    houses: [
      {
        id: "h1",
        address: "15 Rue Victor Hugo",
        city: "Paris",
        district: "16ème arrondissement",
        neighborhood: "Auteuil",
        property_type: "Personnel",
        number_of_rooms: 4,
        surface_area: 95,
        floor_number: 3,
        total_floors: 6,
        elevator_available: true,
        construction_year: 1995,
        heating_type: "Chauffage central au gaz",
        submittedAt: "2024-01-15T10:30:00Z",
        status: "approved",
        plan_analysis: {
          riskLevel: "medium",
          evacuationRoutes: [
            {
              name: "Sortie principale",
              description: "Porte d'entrée principale donnant sur le palier et l'escalier de l'immeuble",
              accessibility: "Dégagée, accès facile"
            },
            {
              name: "Sortie secondaire",
              description: "Balcon avec accès possible aux balcons voisins en cas d'urgence",
              accessibility: "Nécessite coordination avec voisins"
            }
          ],
          fireHazards: [
            {
              location: "Cuisine",
              severity: "high",
              description: "Plaques de cuisson électriques à proximité de rideaux inflammables",
              recommendation: "Installer un détecteur de fumée et éloigner les matériaux inflammables"
            },
            {
              location: "Salon",
              severity: "medium",
              description: "Multiprise surchargée derrière le canapé",
              recommendation: "Réduire le nombre d'appareils branchés, utiliser des multiprises avec protection"
            }
          ],
          safetyEquipment: [
            {
              type: "Extincteur",
              location: "Couloir d'entrée",
              status: "Présent, dernière vérification il y a 18 mois",
              recommendation: "Vérifier la date de péremption et faire contrôler"
            },
            {
              type: "Détecteur de fumée",
              location: "Couloir principal",
              status: "Installé et fonctionnel",
              recommendation: "Tester mensuellement et remplacer les piles annuellement"
            }
          ],
          recommendations: [
            "Installer des détecteurs de fumée supplémentaires dans chaque chambre",
            "Remplacer les rideaux de cuisine par des matériaux ignifuges",
            "Créer un plan d'évacuation familial et le pratiquer régulièrement",
            "Vérifier et mettre à jour l'extincteur",
            "Installer une couverture anti-feu dans la cuisine"
          ],
          roomAnalysis: [
            {
              name: "Cuisine",
              size: "12 m²",
              risks: ["Appareils électriques", "Matériaux inflammables à proximité"],
              safetyScore: 6
            },
            {
              name: "Salon",
              size: "28 m²",
              risks: ["Surcharge électrique", "Absence de détecteur de fumée"],
              safetyScore: 7
            },
            {
              name: "Chambre principale",
              size: "18 m²",
              risks: ["Absence de détecteur de fumée"],
              safetyScore: 8
            },
            {
              name: "Chambre 2",
              size: "14 m²",
              risks: ["Fenêtre avec système de fermeture défectueux"],
              safetyScore: 7
            }
          ]
        }
      },
      {
        id: "h2",
        address: "45 Boulevard Haussmann",
        city: "Paris",
        district: "9ème arrondissement",
        neighborhood: "Opéra",
        property_type: "Building",
        number_of_rooms: 12,
        surface_area: 380,
        floor_number: 2,
        total_floors: 7,
        elevator_available: true,
        construction_year: 1880,
        heating_type: "Chauffage collectif",
        submittedAt: "2024-01-20T14:15:00Z",
        status: "approved",
        plan_analysis: {
          riskLevel: "high",
          evacuationRoutes: [
            {
              name: "Escalier principal",
              description: "Escalier en pierre avec rampe, largeur 1.8m",
              accessibility: "Bonne accessibilité mais absence d'éclairage de secours"
            },
            {
              name: "Escalier de service",
              description: "Escalier secondaire donnant sur cour intérieure",
              accessibility: "Étroit (0.9m), nécessite amélioration de la signalétique"
            },
            {
              name: "Issue de secours",
              description: "Accès par la cour intérieure vers la rue adjacente",
              accessibility: "Parfois encombrée, nécessite maintien dégagé"
            }
          ],
          fireHazards: [
            {
              location: "Installation électrique",
              severity: "high",
              description: "Câblage ancien non conforme aux normes actuelles dans plusieurs pièces",
              recommendation: "Rénovation complète du système électrique requise"
            },
            {
              location: "Cage d'escalier",
              severity: "high",
              description: "Absence de porte coupe-feu entre étages",
              recommendation: "Installation de portes coupe-feu conformes à la réglementation"
            },
            {
              location: "Cave",
              severity: "medium",
              description: "Stockage de matériaux inflammables",
              recommendation: "Réorganiser le stockage et installer détecteurs de fumée"
            }
          ],
          safetyEquipment: [
            {
              type: "Extincteurs",
              location: "Chaque palier",
              status: "Présents mais certains périmés",
              recommendation: "Remplacer les extincteurs périmés et établir un calendrier de vérification"
            },
            {
              type: "Détecteurs de fumée",
              location: "Parties communes",
              status: "Non installés",
              recommendation: "Installation obligatoire dans toutes les parties communes"
            },
            {
              type: "Éclairage de secours",
              location: "Escaliers",
              status: "Absent",
              recommendation: "Installation d'un système d'éclairage de secours conforme"
            }
          ],
          recommendations: [
            "Mise en conformité urgente de l'installation électrique",
            "Installation de portes coupe-feu dans les cages d'escalier",
            "Mise en place d'un système de détection incendie centralisé",
            "Installation d'éclairage de secours dans toutes les zones de circulation",
            "Réalisation d'un diagnostic de sécurité incendie complet",
            "Établissement d'un plan d'évacuation pour l'ensemble du bâtiment",
            "Formation des résidents aux procédures d'évacuation",
            "Vérification annuelle par un organisme agréé"
          ],
          roomAnalysis: [
            {
              name: "Parties communes - Escaliers",
              size: "N/A",
              risks: ["Absence éclairage secours", "Pas de portes coupe-feu", "Câblage ancien"],
              safetyScore: 4
            },
            {
              name: "Appartements individuels",
              size: "Variable",
              risks: ["Installation électrique vétuste", "Absence détecteurs"],
              safetyScore: 5
            },
            {
              name: "Cave commune",
              size: "80 m²",
              risks: ["Stockage inapproprié", "Ventilation insuffisante"],
              safetyScore: 5
            }
          ]
        }
      }
    ]
  },
  {
    userId: "550e8400-e29b-41d4-a716-446655440002",
    userName: "Jean Dupont",
    houses: [
      {
        id: "h3",
        address: "78 Avenue Jean Jaurès",
        city: "Lyon",
        district: "7ème arrondissement",
        neighborhood: "Gerland",
        property_type: "Personnel",
        number_of_rooms: 3,
        surface_area: 72,
        floor_number: 1,
        total_floors: 4,
        elevator_available: false,
        construction_year: 2010,
        heating_type: "Pompe à chaleur",
        submittedAt: "2024-01-22T09:45:00Z",
        status: "approved",
        plan_analysis: {
          riskLevel: "low",
          evacuationRoutes: [
            {
              name: "Porte principale",
              description: "Accès direct au rez-de-chaussée via escalier",
              accessibility: "Excellente, un seul étage à descendre"
            },
            {
              name: "Fenêtre cuisine",
              description: "Donne sur jardin privatif avec portillon d'accès",
              accessibility: "Alternative viable en cas d'urgence"
            }
          ],
          fireHazards: [
            {
              location: "Tableau électrique",
              severity: "low",
              description: "Installation récente et conforme, bien protégée",
              recommendation: "Maintenance préventive annuelle recommandée"
            }
          ],
          safetyEquipment: [
            {
              type: "Détecteurs de fumée",
              location: "Couloir et chambres",
              status: "3 détecteurs installés, tous fonctionnels",
              recommendation: "Continuer les tests mensuels"
            },
            {
              type: "Extincteur",
              location: "Cuisine",
              status: "Récent (6 mois), ABC 2kg",
              recommendation: "RAS, vérification dans 18 mois"
            }
          ],
          recommendations: [
            "Excellent niveau de sécurité actuel",
            "Maintenir les équipements en bon état",
            "Envisager l'installation d'un détecteur de monoxyde de carbone",
            "Documenter et afficher le plan d'évacuation"
          ],
          roomAnalysis: [
            {
              name: "Cuisine",
              size: "10 m²",
              risks: ["Aucun risque majeur identifié"],
              safetyScore: 9
            },
            {
              name: "Salon",
              size: "25 m²",
              risks: ["Aucun risque majeur identifié"],
              safetyScore: 9
            },
            {
              name: "Chambres",
              size: "12-15 m²",
              risks: ["Aucun risque majeur identifié"],
              safetyScore: 9
            }
          ]
        }
      }
    ]
  },
  {
    userId: "550e8400-e29b-41d4-a716-446655440003",
    userName: "Marie Laurent",
    houses: [
      {
        id: "h4",
        address: "23 Rue de la République",
        city: "Marseille",
        district: "1er arrondissement",
        neighborhood: "Noailles",
        property_type: "Personnel",
        number_of_rooms: 2,
        surface_area: 48,
        floor_number: 4,
        total_floors: 5,
        elevator_available: false,
        construction_year: 1960,
        heating_type: "Électrique",
        submittedAt: "2024-01-25T16:20:00Z",
        status: "pending",
        plan_analysis: {
          riskLevel: "medium",
          evacuationRoutes: [
            {
              name: "Escalier principal",
              description: "Escalier commun, étroit",
              accessibility: "4 étages à descendre, peut être difficile en cas de fumée"
            }
          ],
          fireHazards: [
            {
              location: "Chauffage électrique",
              severity: "medium",
              description: "Radiateurs anciens avec thermostat manuel",
              recommendation: "Vérifier l'état des câbles et envisager un remplacement"
            },
            {
              location: "Cuisine",
              severity: "medium",
              description: "Espace restreint avec proximité entre appareils",
              recommendation: "Améliorer l'agencement et installer un détecteur supplémentaire"
            }
          ],
          safetyEquipment: [
            {
              type: "Détecteur de fumée",
              location: "Couloir",
              status: "1 détecteur, piles faibles",
              recommendation: "Remplacer les piles immédiatement et ajouter un second détecteur"
            },
            {
              type: "Extincteur",
              location: "Aucun",
              status: "Absent",
              recommendation: "Installation urgente d'un extincteur ABC"
            }
          ],
          recommendations: [
            "Installer un extincteur dans la cuisine",
            "Ajouter un second détecteur de fumée dans la chambre",
            "Vérifier et moderniser le système de chauffage",
            "Élaborer un plan d'évacuation tenant compte du nombre d'étages",
            "Contacter le syndic pour améliorer la signalétique d'évacuation"
          ],
          roomAnalysis: [
            {
              name: "Cuisine",
              size: "6 m²",
              risks: ["Espace restreint", "Appareils rapprochés"],
              safetyScore: 6
            },
            {
              name: "Salon/Chambre",
              size: "22 m²",
              risks: ["Chauffage ancien", "Absence détecteur proximité"],
              safetyScore: 7
            },
            {
              name: "Chambre",
              size: "12 m²",
              risks: ["Absence détecteur de fumée"],
              safetyScore: 7
            }
          ]
        }
      }
    ]
  }
];

export const mockBlogPosts = [
  {
    id: "b1",
    title: "Les 10 règles d'or de la sécurité incendie à domicile",
    slug: "10-regles-securite-incendie-domicile",
    excerpt: "Découvrez les règles essentielles pour protéger votre famille et votre habitation des risques d'incendie.",
    category: "Prévention",
    author_name: "Admin Fire Safety",
    status: "published",
    views: 1247,
    publishedAt: "2024-01-10T08:00:00Z",
  },
  {
    id: "b2",
    title: "Guide complet des détecteurs de fumée : installation et entretien",
    slug: "guide-detecteurs-fumee-installation-entretien",
    excerpt: "Tout ce que vous devez savoir sur les détecteurs de fumée pour une protection optimale.",
    category: "Équipements",
    author_name: "Admin Fire Safety",
    status: "published",
    views: 892,
    publishedAt: "2024-01-18T10:30:00Z",
  },
  {
    id: "b3",
    title: "Comment créer un plan d'évacuation efficace",
    slug: "creer-plan-evacuation-efficace",
    excerpt: "Les étapes pour élaborer un plan d'évacuation adapté à votre logement et votre famille.",
    category: "Sécurité",
    author_name: "Admin Fire Safety",
    status: "draft",
    views: 0,
    publishedAt: null,
  }
];
