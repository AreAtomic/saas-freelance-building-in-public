# SaaS freelance — building in public

Je relance mon activité de freelance en **avril 2026**, après **trois ans en tant que CTO** d’une startup. Période intense sur le plan humain et produit — et côté technique, je n’ai jamais eu le loisir de poser une **infra vraiment scalable**. Ce n’était ni mon profil d’origine (premier gros SaaS à cette échelle), ni compatible avec le rythme : on enchaînait sans toujours respecter l’ordre **recherche → cadrage → développement**.

## Ce que j’en retiens

**Aller vite en prenant des raccourcis, ça coûte du temps.** Sur un SaaS, une base minimaliste au départ est OK, mais il faut quand même **anticiper le volume** et éviter de figer toute l’API en pur REST/CRUD sans réflexion. Une **EDA minimaliste** (event-driven) dès le départ aide à préparer des évolutions plus tard — et à livrer des features plus vite quand le produit s’accélère.

**Je le fais maintenant, consciemment**, sur un produit que je construis pour **mon propre usage freelance** : pipeline commercial, devis, contrats, suivi de projets, paiements, dashboard — le tout **documenté en public** pour les retours et pour montrer le process, pas seulement le résultat.

## Suivre le projet

- **Code & historique** : [github.com/AreAtomic/saas-freelance-building-in-public](https://github.com/AreAtomic/saas-freelance-building-in-public)
- **Articles & notes** : [aureliensebe.com/blog](https://aureliensebe.com/blog)

## Pour les curieux technique / produit

La spec détaillée (user stories, MVP, infra, DDL) vit dans ce dossier agent : `gestionnaire-contrats-freelance-spec.json` / `.html`, plan de dev dans `docs/PLAN_DEVELOPPEMENT_MVP.md`. Le code applicatif cible le dossier **`crm-freelance/`** à la racine du workspace — ce repo README reste le fil narratif *building in public* ; la doc machine est à côté.

---

*Aurélien Sèbe — développement freelance fullstack. Questions ou retours : ouverts.*
