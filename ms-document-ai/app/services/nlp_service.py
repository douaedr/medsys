import spacy
import json
import logging
from app.models.document import TypeDocument

logger = logging.getLogger(__name__)

class NLPService:

    def __init__(self):
        try:
            self.nlp = spacy.load("fr_core_news_md")
            logger.info("Modèle spaCy chargé avec succès")
        except Exception as e:
            logger.error(f"Erreur chargement modèle spaCy: {e}")
            self.nlp = None

    def extraire_entites(self, texte: str) -> dict:
        """Extraire les entités nommées du texte"""
        if not self.nlp or not texte:
            return {}

        doc = self.nlp(texte)
        entites = {}

        for ent in doc.ents:
            label = ent.label_
            if label not in entites:
                entites[label] = []
            if ent.text not in entites[label]:
                entites[label].append(ent.text)

        return entites

    def extraire_mots_cles(self, texte: str) -> list[str]:
        """Extraire les mots-clés importants"""
        if not self.nlp or not texte:
            return []

        doc = self.nlp(texte)
        mots_cles = []

        for token in doc:
            if (
                not token.is_stop
                and not token.is_punct
                and not token.is_space
                and len(token.text) > 3
                and token.pos_ in ["NOUN", "PROPN", "ADJ"]
            ):
                lemme = token.lemma_.lower()
                if lemme not in mots_cles:
                    mots_cles.append(lemme)

        return mots_cles[:20]

    def generer_resume(self, texte: str, max_phrases: int = 3) -> str:
        """Générer un résumé simple du texte"""
        if not self.nlp or not texte:
            return ""

        doc = self.nlp(texte)
        phrases = list(doc.sents)

        if len(phrases) <= max_phrases:
            return texte

        # Scorer chaque phrase par nombre de mots-clés
        mots_cles = set(self.extraire_mots_cles(texte))
        scores = []

        for phrase in phrases:
            score = sum(
                1 for token in phrase
                if token.lemma_.lower() in mots_cles
            )
            scores.append((score, phrase.text.strip()))

        # Trier et prendre les meilleures phrases
        scores.sort(reverse=True)
        meilleures = [s[1] for s in scores[:max_phrases]]

        return " ".join(meilleures)

    def extraire_infos_medicales(self, texte: str, type_doc: TypeDocument) -> dict:
        """Extraire des infos spécifiques selon le type de document"""
        infos = {}

        if type_doc == TypeDocument.ORDONNANCE:
            # Chercher les médicaments (mots en majuscules ou après "Rp:")
            lignes = texte.split("\n")
            medicaments = []
            for ligne in lignes:
                ligne = ligne.strip()
                if ligne and (ligne.isupper() or ligne.startswith("Rp")):
                    medicaments.append(ligne)
            infos["medicaments"] = medicaments

        elif type_doc == TypeDocument.ANALYSE:
            # Chercher les valeurs numériques avec unités
            import re
            pattern = r'(\w+[\w\s]*)\s*[:=]\s*(\d+[\.,]?\d*)\s*([a-zA-Z/%]+)?'
            matches = re.findall(pattern, texte)
            resultats = []
            for match in matches:
                resultats.append({
                    "parametre": match[0].strip(),
                    "valeur": match[1],
                    "unite": match[2] if match[2] else ""
                })
            infos["resultats"] = resultats

        return infos

    def analyser(self, texte: str, type_doc: TypeDocument) -> dict:
        """Point d'entrée principal"""
        entites = self.extraire_entites(texte)
        mots_cles = self.extraire_mots_cles(texte)
        resume = self.generer_resume(texte)
        infos_medicales = self.extraire_infos_medicales(texte, type_doc)

        return {
            "entites": entites,
            "mots_cles": mots_cles,
            "resume": resume,
            "infos_medicales": infos_medicales
        }

nlp_service = NLPService()