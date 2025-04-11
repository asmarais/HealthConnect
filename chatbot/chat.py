from flask import Flask, request, jsonify
import google.generativeai as genai
from flask_cors import CORS
import requests  

genai.configure(api_key="AIzaSyAthD7hU2TvjupnDLy32yR40hZ9MKF0cuU")  

def get_doctors_from_api():
    try:
        response = requests.get('http://nodejs:5000/api/doctor/')
        response.raise_for_status()  
        doctors_data = response.json().get('doctors', [])
        
        formatted_doctors = []
        for doctor in doctors_data:
            formatted_doctor = {
                'name': f"Dr. {doctor['User']['prenom']} {doctor['User']['nom']}",
                'specialty': doctor['specialite'],
                'location': doctor['User']['adresse'],
                'phone': doctor['User']['numero_de_telephone']
            }
            formatted_doctors.append(formatted_doctor)
        return formatted_doctors
    except requests.exceptions.RequestException as e:
        print(f"Erreur lors de la récupération des docteurs : {e}")
        return []  

def make_prompt(post_text):
    escaped = post_text.replace("\n", " ").replace("'", "").replace('"', "")
    doctors_list = get_doctors_from_api()  
    formatted_doctors = "\n".join([f"{doc['name']} – {doc['specialty']}, 📞 {doc['phone']}" for doc in doctors_list])
    prompt = (
        "Vous êtes un assistant médical virtuel. Votre rôle est d'analyser les symptômes décrits par l'utilisateur, "
        "de suggérer une hypothèse de maladie potentielle (sans poser de diagnostic définitif), puis de guider "
        "l'utilisateur vers le médecin spécialiste approprié en fonction d'une liste dynamique de professionnels "
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
        "     'Vos symptômes nécessitent une attention urgente. Appelez le 15 ou rendez-vous aux urgences les plus proches.'\n\n"
        
        "Contraintes :\n"
        "   - Utilisez un langage clair et empathique, évitez le jargon médical complexe.\n"
        "   - Ne remplacez pas un médecin : rappelez que votre rôle est informel et préliminaire.\n"
        "   - Structurez les recommandations de médecins sous forme de liste claire (nom, spécialité, contact).\n"
    )
    return prompt

# Fonction pour interagir avec Gemini
def get_theme(post_text):
    prompt = make_prompt(post_text)
    try:
        model = genai.GenerativeModel('gemini-1.5-flash-latest')
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Erreur lors de la génération de la réponse : {e}")
        return "Erreur : Impossible de générer une réponse. Veuillez réessayer."

# Initialisation de Flask
app = Flask(__name__)
CORS(app)

# Route pour l'API
@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get("message", "")

    if not user_message:
        return jsonify({"error": "Aucun message fourni"}), 400

    bot_response = get_theme(user_message)
    return jsonify({"response": bot_response})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)