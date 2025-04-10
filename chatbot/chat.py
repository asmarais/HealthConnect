from flask import Flask, request, jsonify
import google.generativeai as genai
from flask_cors import CORS

# Configuration de l'API Gemini
genai.configure(api_key="AIzaSyAthD7hU2TvjupnDLy32yR40hZ9MKF0cuU")

# Liste des médecins (exemple)
doctors_list = [
    {"name": "Dr. Sophie Leroy", "specialty": "Médecine Générale", "location": "Centre Médical Saint-Martin, 12 Rue de la Paix", "phone": "01 23 45 67 89"},
    {"name": "Dr. Paul Dubois", "specialty": "Médecine Générale", "location": "Clinique du Parc, 5 Avenue des Tilleuls", "phone": "02 34 56 78 90"},
    {"name": "Dr. Émilie Rousseau", "specialty": "Cardiologie", "location": "Institut Cardiovasculaire, 8 Rue des Roses", "phone": "03 45 67 89 01"},
    {"name": "Dr. Marc Vidal", "specialty": "Cardiologie", "location": "Hôpital Central, Service Cardiologie", "phone": "04 56 78 90 12"},
    {"name": "Dr. Laura Mercier", "specialty": "Dermatologie", "location": "Clinique Dermatologique Lumière, 22 Boulevard Voltaire", "phone": "05 67 89 01 23"},
    {"name": "Dr. Karim Benali", "specialty": "Dermatologie", "location": "Centre de Santé SkinCare, 15 Rue du Commerce", "phone": "06 78 90 12 34"},
    {"name": "Dr. Alice Dupont", "specialty": "Neurologie", "location": "Hôpital Neurologique, 30 Rue Descartes", "phone": "07 89 01 23 45"},
    {"name": "Dr. Jean-Luc Moreau", "specialty": "Neurologie", "location": "Institut des Neurosciences, 10 Avenue Pasteur", "phone": "08 90 12 34 56"},
    {"name": "Dr. Camille Petit", "specialty": "Pédiatrie", "location": "Maison de l’Enfant, 7 Rue des écoles", "phone": "09 01 23 45 67"},
    {"name": "Dr. Ahmed Ziani", "specialty": "Pédiatrie", "location": "Centre Pédiatrique SantéFuture, 18 Rue des Oliviers", "phone": "01 12 34 56 78"},
    {"name": "Dr. Léa Martin", "specialty": "Gynécologie-Obstétrique", "location": "Clinique Femina, 3 Place de la République", "phone": "02 23 45 67 89"},
    {"name": "Dr. Nora Chéneau", "specialty": "Gynécologie-Obstétrique", "location": "Hôpital Maternité, Service Gynécologie", "phone": "03 34 56 78 90"},
    {"name": "Dr. Thomas Roux", "specialty": "Orthopédie/Traumatologie", "location": "Centre Orthopédique, 14 Avenue des Champs-Élysées", "phone": "04 45 67 89 01"},
    {"name": "Dr. Fatima El Amrani", "specialty": "Orthopédie/Traumatologie", "location": "Clinique du Sport, 9 Rue de la Gare", "phone": "05 56 78 90 12"},
    {"name": "Dr. Hugo Bernard", "specialty": "Gastro-entérologie", "location": "Institut Digestif, 25 Rue de la Fontaine", "phone": "06 67 89 01 23"},
    {"name": "Dr. Yasmine Kader", "specialty": "Gastro-entérologie", "location": "Hôpital Central, Service Gastro", "phone": "07 78 90 12 34"},
    {"name": "Dr. Lucas Perrin", "specialty": "ORL (Oto-Rhino-Laryngologie)", "location": "Clinique ORL AuditionPlus, 6 Rue Mozart", "phone": "08 89 01 23 45"},
    {"name": "Dr. Aïcha Bensaïd", "specialty": "ORL (Oto-Rhino-Laryngologie)", "location": "Centre Médical ORL, 17 Rue Victor Hugo", "phone": "09 90 12 34 56"},
    {"name": "Dr. Clara Dupuis", "specialty": "Allergologie", "location": "Centre Allergie & Asthme, 11 Rue des Lilas", "phone": "01 01 23 45 67"},
    {"name": "Dr. Samir Khaled", "specialty": "Allergologie", "location": "Hôpital Saint-Louis, Service Allergologie", "phone": "02 12 34 56 78"}
]

# Fonction pour générer le prompt
def make_prompt(post_text):
    escaped = post_text.replace("\n", " ").replace("'", "").replace('"', "")
    formatted_doctors = "\n".join([f"{doc['name']} – {doc['specialty']}, 📞 {doc['phone']}" for doc in doctors_list])
    prompt = (
        "Vous êtes un assistant médical virtuel. Votre rôle est d'analyser les symptômes décrits par l'utilisateur, "
        "de suggérer une hypothèse de maladie potentielle (sans poser de diagnostic définitif), puis de guider "
        "l'utilisateur vers le médecin spécialiste approprié en fonction d'une liste prédéfinie de professionnels "
        "de santé et de leurs spécialités.\n\n"
        
        "Étapes à Suivre :\n"
        "1. **Vérification Initiale des Données :**\n"
        "   - Si l'utilisateur n'a pas décrit de symptômes clairs (ex: 'Je ne sais pas', 'Rien', ou des données non pertinentes comme 'Bonjour'), "
        "     répondez avec un message empathique et demandez-lui de préciser ses symptômes. Exemple :\n"
        "     'Je suis là pour vous aider ! Pouvez-vous me décrire vos symptômes (par exemple, douleur, fatigue, fièvre) afin que je puisse vous orienter au mieux ?'\n"
        "   - Si des symptômes sont détectés, passez à l'étape suivante.\n\n"
        
        "2. **Collecte des Symptômes :**\n"
        f"   - L'utilisateur a décrit les symptômes suivants : {escaped}\n"
        "   - Confirmez les symptômes détectés dans la réponse.\n\n"
        
        "3. **Analyse des Symptômes :**\n"
        "   - Identifiez les mots-clés médicaux pertinents (ex: 'céphalée' pour maux de tête, 'dyspnée' pour essoufflement).\n"
        "   - Comparez-les à une base de connaissances pour générer des hypothèses de maladies plausibles (ex: migraine, infection respiratoire).\n"
        "   - Évaluez la gravité potentielle (ex: symptômes urgents comme douleur thoracique ou difficultés respiratoires → orienter vers les urgences).\n\n"
        
        "4. **Prédiction de la Maladie :**\n"
        "   - Listez 1 à 3 maladies possibles par ordre de probabilité décroissante, avec une explication concise pour chaque hypothèse "
        "     (ex: 'Une sinusite est plausible en raison de vos maux de tête et congestion nasale').\n"
        "   - Ajoutez systématiquement cet avertissement : 'Ceci est une suggestion basée sur des informations limitées. Consultez un médecin pour un diagnostic précis.'\n\n"
        
        "5. **Orientation vers un Spécialiste :**\n"
        "   - En fonction de l'hypothèse la plus probable, recommandez un médecin spécialiste adapté en utilisant cette liste :\n"
        f"     {formatted_doctors}\n"
        "   - Exemple de réponse :\n"
        "     'Pour ces symptômes, je vous recommande de consulter un dermatologue. Voici des spécialistes disponibles : "
        "[Dr. Laura Mercier – Clinique Dermatologique Lumière, 📞 05 67 89 01 23 ; Dr. Karim Benali – Centre de Santé SkinCare, 📞 06 78 90 12 34].'\n"
        "   - Si les symptômes sont urgents (ex: douleur thoracique, difficultés respiratoires), insistez pour une action immédiate :\n"
        "     ' Ascending 'Vos symptômes nécessitent une attention urgente. Appelez le 15 ou rendez-vous aux urgences les plus proches.'\n\n"
        
        "Contraintes :\n"
        "   - Utilisez un langage clair et empathique, évitez le jargon médical complexe.\n"
        "   - Ne remplacez pas un médecin : rappelez que votre rôle est informel et préliminaire.\n"
        "   - Structurez les recommandations de médecins sous forme de liste claire (nom, spécialité, contact).\n\n"
        
        "Exemple de Dialogue Réussi :\n"
        "Utilisateur : 'J'ai des démangeaisons et des plaques rouges sur la peau depuis 2 jours.'\n"
        "Chatbot :\n"
        "1. Symptômes analysés : Démangeaisons, plaques rouges, durée de 48h.\n"
        "2. Hypothèses :\n"
        "   - Réaction allergique (probable).\n"
        "   - Dermatite de contact (possible).\n"
        "3. Recommandation : Consultez un dermatologue ou un allergologue. Voici des spécialistes disponibles : "
        "[Dr. Laura Mercier – Dermatologie, 📞 05 67 89 01 23 ; Dr. Clara Dupuis – Allergologie, 📞 01 01 23 45 67].\n"
        "4. Avertissement : En cas de gonflement du visage ou de difficultés respiratoires, appelez le 15 immédiatement.\n\n"
        
        "Objectif Final :\n"
        "Guider l'utilisateur de manière rapide, structurée et sécurisée vers la prise en charge médicale appropriée."
    )
    return prompt

# Fonction pour interagir avec Gemini
def get_theme(post_text):
    prompt = make_prompt(post_text)
    try:
        # Appel de l'API Gemini
        model = genai.GenerativeModel('gemini-1.5-flash-latest')
        response = model.generate_content(prompt)
        return response.text.strip()  # Retourne la réponse générée par le modèle
    except Exception as e:
        print(f"Erreur lors de la génération de la réponse : {e}")
        return "Erreur : Impossible de générer une réponse. Veuillez réessayer."

# Initialisation de Flask
app = Flask(__name__)
CORS(app)  

# Route pour l'API
@app.route('/chat', methods=['POST'])
def chat():
    # Récupérer les données JSON de la requête
    data = request.json
    user_message = data.get("message", "")

    if not user_message:
        return jsonify({"error": "Aucun message fourni"}), 400

    # Générer la réponse du chatbot
    bot_response = get_theme(user_message)

    # Retourner la réponse en JSON
    return jsonify({"response": bot_response})

# Démarrer l'application Flask
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
