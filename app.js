const $ = (id) => document.getElementById(id);

const CTA = "Disponible sur mon stand et sur Vinted — abonne-toi pour découvrir mes prochains produits !";
const analysisPrompt = `Analyse uniquement la photo de ce produit pour préparer une vidéo TikTok destinée en priorité à gagner des abonnés et des commentaires.

RÈGLES ABSOLUES :
- N'affiche, ne demande et n'invente JAMAIS le prix.
- N'invente pas de marque, matière, dimensions, fonctions ou promesses invisibles sur la photo.
- Si une information est incertaine, écris « incertain ».
- Le produit sera présenté sur un stand et sur Vinted.
- Le format final sera composé de 3 vidéos verticales de 8 secondes à assembler.
- La voix off doit pouvoir être générée en même temps que chaque vidéo.
- Le ton doit être naturel, dynamique et non agressivement publicitaire.
- L'objectif n°1 est : arrêter le scroll, faire regarder jusqu'au bout, provoquer un commentaire, puis obtenir un abonnement.

Réponds en français avec exactement ces rubriques :
PRODUIT :
DÉTAILS VISIBLES :
ANGLE LE PLUS FORT :
HOOK VISUEL :
QUESTION À POSER EN COMMENTAIRE :
PUBLIC PROBABLE :
MOTS À ÉVITER / INCERTITUDES :
IDÉE DE MISE EN SCÈNE :`;

$("analysisPrompt").value = analysisPrompt;

const photoInput = $("photoInput");
const preview = $("preview");
const dropHint = $("dropHint");
const analysisResult = $("analysisResult");
const status = $("status");

photoInput.addEventListener("change", () => {
  const file = photoInput.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    preview.src = reader.result;
    preview.hidden = false;
    dropHint.hidden = true;
    sessionStorage.setItem("tiktok-pack-photo", reader.result);
  };
  reader.readAsDataURL(file);
});

function flash(message) {
  status.textContent = message;
  window.setTimeout(() => {
    if (status.textContent === message) status.textContent = "";
  }, 2200);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const temp = document.createElement("textarea");
    temp.value = text;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand("copy");
    temp.remove();
  }
}

$("copyAnalysisBtn").addEventListener("click", async () => {
  await copyText(analysisPrompt);
  flash("Prompt GPT copié.");
});

function normalize(text) {
  return text.replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim();
}

function stripPrices(text) {
  return String(text || "")
    .replace(/\b\d+(?:[.,]\d+)?\s*(?:€|euros?)\b/gi, "")
    .replace(/\b(?:prix|tarif)\s*[:=-]?\s*[^\n,;.]*/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function fieldFromAnalysis(label, fallback) {
  const text = analysisResult.value;
  const re = new RegExp(`${label}\\s*:\\s*([^\\n]+)`, "i");
  return stripPrices(text.match(re)?.[1] || fallback);
}

function sanitizedSource() {
  let s = normalize(analysisResult.value);
  s = s.replace(/\bprix\s*:\s*[^\n]*/gi, "");
  s = s.replace(/\b\d+(?:[.,]\d+)?\s*(?:€|euros?)\b/gi, "[prix supprimé]");
  return s;
}

function buildPack() {
  if (!analysisResult.value.trim()) {
    flash("Colle d’abord l’analyse de GPT.");
    analysisResult.focus();
    return;
  }

  const product = fieldFromAnalysis("PRODUIT", "le produit visible sur la photo") || "le produit visible sur la photo";
  const details = fieldFromAnalysis("DÉTAILS VISIBLES", "reprendre uniquement les détails réellement visibles");
  const angle = fieldFromAnalysis("ANGLE LE PLUS FORT", "mettre en avant le détail visuel le plus intrigant");
  const hook = fieldFromAnalysis("HOOK VISUEL", "gros plan immédiat sur le détail le plus surprenant");
  const question = fieldFromAnalysis("QUESTION À POSER EN COMMENTAIRE", "Tu le choisirais, toi ?");
  const audience = fieldFromAnalysis("PUBLIC PROBABLE", "public TikTok intéressé par les trouvailles produit");
  const staging = fieldFromAnalysis("IDÉE DE MISE EN SCÈNE", "mouvement court, naturel et très lisible sur mobile");
  const source = sanitizedSource();

  $("scene1").value = `VIDÉO 1/3 — 8 SECONDES — HOOK\nFormat vertical 9:16, rythme TikTok, rendu réaliste. Utiliser la photo du produit comme référence visuelle principale. Ne jamais afficher ni prononcer de prix. Ne pas inventer de caractéristique non visible.\n\nProduit : ${product}.\nDétails fiables : ${details}.\nPublic : ${audience}.\n\n0–2 s : ${hook}. Le produit doit être compris immédiatement, avec un cadrage serré et un mouvement caméra court qui arrête le scroll.\n2–6 s : montrer rapidement ${angle}, avec ${staging}.\n6–8 s : finir sur un plan intrigant qui donne envie de voir la suite, sans tout révéler.\n\nVOIX OFF FRANÇAISE, naturelle, énergique, générée avec la vidéo :\n« Attends… regarde bien ce détail. Tu avais déjà vu ça ? »\n\nTexte écran très court : « TU AVAIS VU ÇA ? »\nPas de prix, pas de logo inventé, pas de promesse exagérée.`;

  $("scene2").value = `VIDÉO 2/3 — 8 SECONDES — DÉMONSTRATION / RÉTENTION\nFormat vertical 9:16, même produit, même style visuel que la partie 1. Ne jamais afficher ni prononcer de prix. Utiliser seulement les informations visibles et fiables.\n\nProduit : ${product}.\nÀ montrer : ${details}.\nAngle principal : ${angle}.\n\n0–3 s : reprendre immédiatement le produit avec un angle différent, sans intro.\n3–6 s : montrer le détail ou l’usage le plus intéressant suggéré par l’analyse, uniquement s’il est visuellement démontrable.\n6–8 s : poser une question visuelle claire et laisser une micro-pause pour inciter au commentaire.\n\nVOIX OFF FRANÇAISE, naturelle, générée avec la vidéo :\n« Le détail que je préfère, c’est celui-là. Et toi, tu en penses quoi ? »\n\nTexte écran : « TU VALIDES ? 👇 »\nQuestion commentaire à exploiter : « ${question} »\nPas de prix, pas de fausse caractéristique.`;

  $("scene3").value = `VIDÉO 3/3 — 8 SECONDES — CTA COMMENTAIRE + ABONNEMENT\nFormat vertical 9:16, conclusion visuelle cohérente avec les deux premières parties. Ne jamais afficher ni prononcer de prix.\n\n0–2 s : beau plan final du produit, lisible, propre, avec un mouvement léger. La question « ${question} » apparaît immédiatement à l’écran.\n2–8 s : conserver le produit et la question visibles, puis faire entendre le CTA complet ci-dessous à un débit naturel, sans le couper.\n\nVOIX OFF FRANÇAISE, naturelle et souriante, générée avec la vidéo :\n« ${CTA} »\n\nTexte écran final :\n« STAND + VINTED »\n« ABONNE-TOI POUR LES PROCHAINS 👀 »\n\nAucun prix. Aucun argument de vente inventé. Le CTA doit rester visible jusqu’à la dernière image.`;

  $("caption").value = `${product.charAt(0).toUpperCase() + product.slice(1)} 👀\n${question}\n\n${CTA}`;
  const productTag = "#" + product
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 24);
  $("hashtags").value = `${productTag.length > 1 ? productTag : "#Trouvaille"} #Trouvaille #VintedFrance #PetitCommerce #PourToi`;

  $("results").hidden = false;
  sessionStorage.setItem("tiktok-pack-analysis", analysisResult.value);
  sessionStorage.setItem("tiktok-pack-generated", JSON.stringify({
    scene1: $("scene1").value,
    scene2: $("scene2").value,
    scene3: $("scene3").value,
    caption: $("caption").value,
    hashtags: $("hashtags").value,
    source
  }));
  $("results").scrollIntoView({ behavior: "smooth", block: "start" });
  flash("Pack généré.");
}

$("generateBtn").addEventListener("click", buildPack);

document.querySelectorAll(".copy-scene").forEach((button) => {
  button.addEventListener("click", async () => {
    const target = $(button.dataset.target);
    await copyText(target.value);
    const old = button.textContent;
    button.textContent = "Copié ✓";
    window.setTimeout(() => (button.textContent = old), 1200);
  });
});

$("copyAllBtn").addEventListener("click", async () => {
  const all = [
    "=== VIDÉO 1 ===", $("scene1").value,
    "=== VIDÉO 2 ===", $("scene2").value,
    "=== VIDÉO 3 ===", $("scene3").value,
    "=== LÉGENDE ===", $("caption").value,
    "=== HASHTAGS ===", $("hashtags").value
  ].join("\n\n");
  await copyText(all);
  flash("Pack complet copié.");
});

$("resetBtn").addEventListener("click", () => {
  photoInput.value = "";
  preview.src = "";
  preview.hidden = true;
  dropHint.hidden = false;
  analysisResult.value = "";
  $("results").hidden = true;
  ["tiktok-pack-photo", "tiktok-pack-analysis", "tiktok-pack-generated"].forEach((k) => sessionStorage.removeItem(k));
  flash("Réinitialisé.");
});

(function restore() {
  const p = sessionStorage.getItem("tiktok-pack-photo");
  const a = sessionStorage.getItem("tiktok-pack-analysis");
  const g = sessionStorage.getItem("tiktok-pack-generated");
  if (p) {
    preview.src = p;
    preview.hidden = false;
    dropHint.hidden = true;
  }
  if (a) analysisResult.value = a;
  if (g) {
    try {
      const data = JSON.parse(g);
      ["scene1", "scene2", "scene3", "caption", "hashtags"].forEach((id) => {
        if (data[id]) $(id).value = data[id];
      });
      $("results").hidden = false;
    } catch {}
  }
})();
