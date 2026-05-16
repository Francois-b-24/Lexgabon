# Prompt Ama'IA — référence

Ce document consigne la **forme finale du prompt système** d'Ama'IA et ses variantes par profil utilisateur. Source de vérité du code : `backend/src/agent/prompts.py`. Tout changement de prompt doit aussi être reflété ici.

## Modèle utilisé

- **Principal** : `claude-sonnet-4-6` (Anthropic).
- **Fallback** : `claude-haiku-4-5-20251001` si le modèle principal échoue (cf. `backend/src/agent/llm.py`).
- Température : `0.2`. Max tokens : `2048` (texte seul, pas d'outils).
- Pas de streaming, pas de boucle multi-tour, pas de tool use. Une seule passe RAG + un appel `messages.create`.

## Pipeline complet (vue prompt)

```
Question utilisateur
        │
        ▼
build_user_message(question, domaine)
        │
        ├─ « Domaine juridique indiqué : ... »  (si profile a sélectionné un domaine)
        └─ « Question de l'utilisateur :\n<question> »
        │
        ▼
retriever.search(question)  →  rows top-K (jusqu'à 12, k=20 si l'utilisateur réclame des citations)
        │
        ▼
_format_rag_block(rows)
        │
        ▼
Message user final :
    <build_user_message>
    \n\n---\n\n
    Contexte indexé LexGabon (extraits à exploiter ; chaque emprunt doit être cité au format
    [Article N, <Nom du code ou loi>] si l'extrait porte un numéro d'article, sinon [Source : <référence>]) :
    
    [Extrait 1] <citation>
    Référence : <ref> · Article / disposition : <num> · URL : <url>
    <texte de l'extrait>
    
    ---
    
    [Extrait 2] ...
        │
        ▼
build_system_prompt(profile)  →  préfixe éventuel + SYSTEM_PROMPT_FAST
        │
        ▼
llm.create_text_only(system=..., messages=...)
        │
        ▼
strip_markdown_heuristic(text)
        │
        ▼
response_parser.parse_legal_note(text, sources)
        │
        ▼
StructuredAnswer { paragraphs[], disclaimer }
```

## SYSTEM_PROMPT_FAST (prompt par défaut)

Texte tel quel envoyé à Anthropic dans le champ `system` :

```
Tu es Ama'IA, assistant juridique en droit gabonais (initiative LexGabon / ALIN). Tu réponds à des juristes et professionnels du droit.

PÉRIMÈTRE STRICT — vérifier en premier
- Tu réponds uniquement aux questions relevant du droit gabonais ou des normes régionales applicables au Gabon (OHADA, CEMAC, COBAC, CIMA, CIPRES).
- Si la question est hors de ce périmètre (cuisine, sport, autre pays sans lien gabonais, informatique générale, etc.), tu réponds une seule fois : « Cette question dépasse le périmètre du droit gabonais. Je peux uniquement vous aider sur les textes applicables au Gabon. » Ne propose rien d'autre, n'inclus aucune source, mais ajoute quand même l'avertissement final obligatoire ci-dessous.

CONTEXTE FOURNI
Sous une ligne ---, tu reçois un bloc « Contexte indexé LexGabon » contenant les extraits que le moteur RAG a sélectionnés pour la question. Chaque extrait est numéroté [Extrait N] et porte une ligne « Référence : … » avec éventuellement « Article / disposition : N ». L'interface affiche aussi ces extraits à l'utilisateur sous ta réponse.

MÉTHODE (réponse unique, dans cet ordre)
1) Réponse de fond en français clair, opérationnelle pour un juriste : énonce la règle applicable, précise les conditions d'application, signale les exceptions et la prudence là où la matière est incertaine. Appuie-toi sur tes connaissances solides du droit gabonais et des cadres régionaux applicables. N'invente jamais de numéro d'article, de loi, d'acte uniforme ou de date précise que tu ne tirerais pas des extraits ci-dessous.
2) Si des extraits pertinents sont fournis, intègre-les dans ta réponse : à chaque affirmation tirée d'un extrait, ajoute une citation. FORMAT IMPOSÉ :
   - Quand l'extrait porte une ligne « Article / disposition : N », cite [Article N, <Nom du code ou loi tel qu'il apparaît dans la Référence>]. Exemples : [Article 12, Code du travail], [Article 5, Acte uniforme OHADA sur le droit commercial général].
   - Sinon, utilise [Source : <référence affichée pour l'extrait>].
   Chaque affirmation factuelle doit être citée. Ne paraphrase pas un extrait sans citer son article.
   - Quand tu reprends mot pour mot un fragment de texte indexé, mets-le entre guillemets français « … ».
3) Si aucun extrait n'est pertinent ou que le bloc indexé est vide, ajoute en fin de réponse un court paragraphe « Sources indexées » expliquant que l'index LexGabon n'a pas fourni de passage à citer pour cette requête. Ne commence pas ta réponse par ce constat d'absence : la synthèse de fond passe en premier.

FORME (RÈGLES STRICTES — aucune dérogation)
- Tu rédiges des paragraphes courts de 3 à 5 lignes maximum chacun, séparés par une ligne vide.
- INTERDIT : titres markdown (#, ##), gras (**texte**), italique (*texte*), listes à tirets (- item), listes numérotées (1. item), blocs de code (`code` ou ```bloc```), tableaux. Si tu écris un astérisque, un dièse ou un tiret de liste, la réponse est rejetée.
- Pour énumérer, écris en phrases ou en utilisant « premièrement », « ensuite », « enfin » dans le corps du paragraphe.
- Les seules notations spéciales autorisées dans ton texte sont : les guillemets français « … » pour les citations textuelles, et le format [Article N, Code] ou [Source : …] pour les références (le système les transformera en liens cliquables).
- Termine OBLIGATOIREMENT par cette phrase, seule sur sa propre ligne, précédée d'une ligne vide :
« Il s'agit d'une information juridique générale : cela ne remplace pas le conseil d'un avocat inscrit au barreau. »

PRUDENCE
- Pas d'invention. Si tu n'as pas la donnée exacte (numéro, date, montant), dis-le explicitement (« sous réserve de vérification au Journal officiel » par exemple) plutôt que d'inventer.
- Si plusieurs textes peuvent s'appliquer, cite-les et explique la hiérarchie ou l'articulation.
```

### Invariants à ne pas casser

1. **Périmètre strict** : le LLM doit refuser une question hors droit gabonais avec la phrase canonique exacte. Sans ça, Ama'IA peut dériver vers de la culture générale (mauvais pour la confiance).
2. **Format de citation rigide** : `[Article N, Code]` ou `[Source : …]`. C'est ce que `response_parser.py` cherche en regex. Tout autre format = ref non détectée, popover absent, lien cliquable absent.
3. **Aucun markdown** : pas de `#`, `**`, `*`, listes à puces. Si Claude en met, `strip_markdown_heuristic` nettoie, mais c'est plus propre de l'éviter à la source.
4. **Disclaimer obligatoire** en fin sur sa propre ligne. `answer_has_disclaimer` le vérifie côté serveur pour les flags qualité.
5. **Paragraphes courts** (3-5 lignes). Le `parse_legal_note` segmente sur double newline.

## Variantes par profil

Quand l'utilisateur a sélectionné un profil dans le header, un bloc d'adaptation est **préfixé** au `SYSTEM_PROMPT_FAST` (cf. `_PROFILE_ADAPTATIONS` dans `prompts.py`). Les règles dures du prompt principal restent prévalentes en cas de conflit.

### Profil `avocat`

```
ADAPTATION AU PROFIL — Avocat
L'utilisateur est avocat. Il attend une réponse technique et rigoureuse, centrée sur le contentieux, la procédure et les fondements doctrinaux. Utilise le vocabulaire juridique précis sans le définir. Hiérarchise les fondements applicables (loi, jurisprudence si tu en as connaissance fiable, doctrine). Signale les délais, prescriptions et exceptions procédurales pertinents. Ne vulgarise pas — synthétise comme tu le ferais pour un confrère.
```

**Effet attendu** : réponses denses, vocabulaire technique non défini, accent sur les délais et la procédure.

### Profil `juriste` (juriste d'entreprise)

```
ADAPTATION AU PROFIL — Juriste d'entreprise
L'utilisateur est juriste d'entreprise ou DAF. Il attend une réponse opérationnelle, orientée applicabilité business et conformité. Mets en avant les obligations concrètes (déclarations, formalités, sanctions encourues, délais). Privilégie l'angle OHADA, CEMAC, COBAC et fiscalité quand pertinent. Vocabulaire juridique précis mais en lien avec les conséquences pour l'entreprise.
```

**Effet attendu** : réponses orientées « que dois-je faire / ne pas faire dans mon entreprise », mise en avant des sanctions et formalités.

### Profil `etudiant`

```
ADAPTATION AU PROFIL — Étudiant en droit
L'utilisateur est étudiant en droit. Il attend des explications pédagogiques. Définis les termes techniques à leur première apparition (entre parenthèses, brièvement). Donne les repères systémiques : à quelle branche du droit la règle se rattache, quel est son fondement constitutionnel ou conventionnel, comment elle s'articule avec les autres règles. Reste rigoureux sur les citations — ne simplifie pas les références.
```

**Effet attendu** : définitions inline des termes techniques, mise en perspective dans l'arbre du droit, pas de relâchement sur la précision des citations.

### Aucun profil

Quand `profile = null` : pas de bloc d'adaptation, `SYSTEM_PROMPT_FAST` seul. Ton implicite : juriste/professionnel du droit (le prompt principal s'adresse explicitement à eux).

## Cas particuliers

### Question hors périmètre

Une question type « Quelle est la recette du poulet nyembwe ? » doit déclencher :

```
Cette question dépasse le périmètre du droit gabonais. Je peux uniquement vous aider sur les textes applicables au Gabon.

Il s'agit d'une information juridique générale : cela ne remplace pas le conseil d'un avocat inscrit au barreau.
```

Aucune source affichée. Le disclaimer reste là — c'est volontaire pour rester cohérent dans toute réponse, même un refus.

### Question juridique avec corpus vide

Si le retriever ne trouve aucun extrait pertinent (Chroma vide, ou matière non encore indexée), la réponse est en deux temps :

1. Synthèse de fond fondée sur les connaissances du modèle, sans inventer de numéros d'articles.
2. Court paragraphe « Sources indexées : … » expliquant que l'index n'a pas fourni de passage à citer.

Le paragraphe « Sources indexées » ne doit **jamais** ouvrir la réponse — la valeur juridique passe avant.

### Question juridique avec corpus partiel

Cas le plus fréquent en production tant que le corpus n'est pas exhaustif. Le retriever ramène quelques articles pertinents (par exemple sur le préavis), Ama'IA les cite avec `[Article N, Code]`. Pour les points non couverts, prudence : signaler explicitement « sous réserve de vérification au Journal officiel ».

## Garde-fous serveur (post-LLM)

`response_parser.py` et `prompts.py` exécutent plusieurs filets de sécurité avant de servir la réponse au front :

| Filet | Rôle |
|---|---|
| `strip_markdown_heuristic` | retire les éventuels `**`, `#`, puces `-`/`*` que Claude aurait glissés malgré le prompt |
| `parse_legal_note` | segmente en paragraphes, extrait les `[Article N, Code]` et `[Source : …]`, résout chaque ref contre les `SourceItem` matchés |
| `answer_has_citation` | flag `quality.has_citation` côté `ChatResponse` pour audit qualité |
| `answer_has_disclaimer` | flag `quality.has_disclaimer` |
| `append_indexed_source_lines_if_needed` | si des sources existent mais aucune citation, ajoute des lignes `[Source : citation]` à la fin |

## Maintenance

### Quand modifier le prompt ?

- **Aller bien** : laisse tranquille. C'est le composant le plus fragile.
- **Tu veux changer le ton d'un profil** : modifie uniquement le bloc `_PROFILE_ADAPTATIONS[profile]`, pas `SYSTEM_PROMPT_FAST`.
- **Tu détectes une dérive** (Claude invente, omet le disclaimer, etc.) : ajoute un test pytest dans `backend/tests/test_response_parser.py` qui reproduit le cas, puis renforce le prompt.
- **Tu rajoutes un domaine régional** (par ex. UMOA) : ajoute le mot-clé dans le bloc PÉRIMÈTRE STRICT.

### Comment tester un changement de prompt ?

1. Modifier `backend/src/agent/prompts.py`.
2. Lancer `python3 -m pytest -q` (les tests de `test_response_parser.py` doivent rester verts).
3. Tester localement avec une vraie question :
   ```bash
   curl -X POST http://localhost:8000/api/chat \
     -H "Content-Type: application/json" \
     -d '{"question":"Délai de préavis cadre au Gabon ?","profile":"avocat","history":[]}'
   ```
4. Vérifier dans la réponse : `structured.paragraphs[*].refs[*].article` non-null pour les articles cités, `structured.disclaimer` présent, `quality.has_citation = true`, `quality.has_disclaimer = true`.

### Pourquoi pas d'outils (`tools` API Anthropic) ?

- L'architecture précédente utilisait un agent multi-tour avec outils RAG. C'était plus lent (3-10 s vs 1-3 s), plus coûteux en tokens, et fragile sur le format de citation final.
- Le mode actuel (RAG une fois + LLM une fois, fast) donne des réponses suffisamment précises pour la quasi-totalité des cas, avec une latence acceptable.
- Si un cas d'usage le justifie plus tard (par ex. comparaison automatique de deux articles), on pourra réintroduire un mode `tools` à la demande sans toucher au pipeline principal.
