const $ = (id) => document.getElementById(id);

const CTA = "Disponible sur mon stand et sur Vinted — abonne-toi pour découvrir mes prochains produits !";
const analysisPrompt = `Analyse uniquement la photo de ce produit pour préparer une vidéo TikTok destinée en priorité à gagner des abonnés et des commentaires.

RÈGLES ABSOLUES :
- N'affiche, ne demande et n'invente JAMAIS le prix.
- N'invente pas de marque, matière, dimensions, fonctions ou promesses invisibles sur la photo.
- Si une information est incertaine, écris « incertain ».
- Le produit sera présenté sur un stand et sur Vinted.
- Le format final sera composé de 3 vidéos verticales de 8 secondes à assembler.
- La voix off doit être générée en même temps que chaque vidéo.
- Ton naturel, dynamique et non agressivement publicitaire.
- Objectif prioritaire : arrêter le scroll, faire regarder jusqu'au bout, provoquer un commentaire, puis obtenir un abonnement.

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
const photoDone = $("photoDone");
const analysisResult = $("analysisResult");
const generateBtn = $("generateBtn");
const status = $("status");

function updateGenerateState(){
  generateBtn.disabled = !analysisResult.value.trim();
}

photoInput.addEventListener("change", () => {
  const file = photoInput.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    preview.src = reader.result;
    preview.hidden = false;
    dropHint.hidden = true;
    photoDone.hidden = false;
    try { sessionStorage.setItem("tiktok-pack-photo", reader.result); } catch {}
    $("analysisStep").scrollIntoView({behavior:"smooth", block:"start"});
  };
  reader.readAsDataURL(file);
});

analysisResult.addEventListener("input", updateGenerateState);
analysisResult.addEventListener("paste", () => setTimeout(updateGenerateState, 0));

function flash(message){
  status.textContent = message;
  clearTimeout(flash.timer);
  flash.timer = setTimeout(() => { if(status.textContent===message) status.textContent=""; }, 2200);
}

async function copyText(text){
  try{ await navigator.clipboard.writeText(text); }
  catch{
    const temp=document.createElement("textarea");
    temp.value=text;document.body.appendChild(temp);temp.select();document.execCommand("copy");temp.remove();
  }
}

$("copyAnalysisBtn").addEventListener("click", async () => {
  await copyText(analysisPrompt);
  const b=$("copyAnalysisBtn"), old=b.textContent;
  b.textContent="✓ Instruction copiée";
  flash("Ajoute maintenant la photo dans ChatGPT et colle l’instruction.");
  setTimeout(()=>b.textContent=old,1600);
});

function stripPrices(text){
  return String(text||"")
    .replace(/\b\d+(?:[.,]\d+)?\s*(?:€|euros?)\b/gi,"")
    .replace(/\b(?:prix|tarif)\s*[:=-]?\s*[^\n,;.]*/gi,"")
    .replace(/\s{2,}/g," ").trim();
}
function field(label,fallback){
  const re=new RegExp(`${label}\\s*:\\s*([^\\n]+)`,"i");
  return stripPrices(analysisResult.value.match(re)?.[1]||fallback);
}

function buildPack(){
  if(!analysisResult.value.trim()){flash("Colle d’abord la réponse de ChatGPT.");return;}
  const product=field("PRODUIT","le produit visible sur la photo")||"le produit visible sur la photo";
  const details=field("DÉTAILS VISIBLES","montrer uniquement les détails visibles");
  const angle=field("ANGLE LE PLUS FORT","mettre en avant le détail le plus intrigant");
  const hook=field("HOOK VISUEL","gros plan immédiat sur le produit");
  const question=field("QUESTION À POSER EN COMMENTAIRE","Tu le choisirais, toi ?");
  const audience=field("PUBLIC PROBABLE","public TikTok intéressé par les trouvailles produit");
  const staging=field("IDÉE DE MISE EN SCÈNE","mouvement court, naturel et lisible sur mobile");

  $("scene1").value=`VIDÉO 1/3 — 8 SECONDES — HOOK\nFormat vertical 9:16, rendu réaliste, rythme TikTok. Utiliser la photo comme référence principale. Aucun prix. Ne rien inventer.\n\nProduit : ${product}.\nDétails : ${details}.\nPublic : ${audience}.\n\n0–2 s : ${hook}.\n2–6 s : montrer ${angle}, avec ${staging}.\n6–8 s : finir sur un plan intrigant qui donne envie de voir la suite.\n\nVOIX OFF FRANÇAISE générée avec la vidéo :\n« Attends… regarde bien ce détail. Tu avais déjà vu ça ? »\n\nTexte écran : « TU AVAIS VU ÇA ? »\nAucun prix, aucun logo inventé, aucune promesse exagérée.`;

  $("scene2").value=`VIDÉO 2/3 — 8 SECONDES — PRODUIT\nFormat vertical 9:16, même produit et même style. Aucun prix. Utiliser uniquement les informations visibles.\n\nProduit : ${product}.\nÀ montrer : ${details}.\nAngle : ${angle}.\n\n0–3 s : reprendre immédiatement le produit avec un angle différent.\n3–6 s : montrer le détail le plus intéressant, uniquement s’il est visuellement démontrable.\n6–8 s : faire une micro-pause qui invite au commentaire.\n\nVOIX OFF FRANÇAISE générée avec la vidéo :\n« Le détail que je préfère, c’est celui-là. Et toi, tu en penses quoi ? »\n\nTexte écran : « TU VALIDES ? 👇 »\nQuestion : « ${question} »\nAucun prix, aucune caractéristique inventée.`;

  $("scene3").value=`VIDÉO 3/3 — 8 SECONDES — COMMENTAIRE + ABONNEMENT\nFormat vertical 9:16, conclusion cohérente avec les deux premières vidéos. Aucun prix.\n\n0–2 s : beau plan final du produit avec la question « ${question} » à l’écran.\n2–8 s : garder le produit visible et faire entendre le CTA à un débit naturel.\n\nVOIX OFF FRANÇAISE générée avec la vidéo :\n« ${CTA} »\n\nTexte écran final :\n« STAND + VINTED »\n« ABONNE-TOI POUR LES PROCHAINS 👀 »\n\nAucun prix. Aucun argument inventé.`;

  $("caption").value=`${product.charAt(0).toUpperCase()+product.slice(1)} 👀\n${question}\n\n${CTA}`;
  const tag="#"+product.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9]/g,"").slice(0,24);
  $("hashtags").value=`${tag.length>1?tag:"#Trouvaille"} #Trouvaille #VintedFrance #PetitCommerce #PourToi`;

  try{
    sessionStorage.setItem("tiktok-pack-analysis",analysisResult.value);
    sessionStorage.setItem("tiktok-pack-generated",JSON.stringify({scene1:$("scene1").value,scene2:$("scene2").value,scene3:$("scene3").value,caption:$("caption").value,hashtags:$("hashtags").value}));
  }catch{}
  $("results").hidden=false;
  $("results").scrollIntoView({behavior:"smooth",block:"start"});
  flash("Pack créé ✓");
}

generateBtn.addEventListener("click",buildPack);

document.querySelectorAll(".copy-video,.copy-extra").forEach(button=>{
  button.addEventListener("click",async()=>{
    const target=$(button.dataset.target);await copyText(target.value);
    const old=button.textContent;button.textContent="✓ Copié";setTimeout(()=>button.textContent=old,1200);
  });
});

$("copyAllBtn").addEventListener("click",async()=>{
  const all=["=== VIDÉO 1 ===",$("scene1").value,"=== VIDÉO 2 ===",$("scene2").value,"=== VIDÉO 3 ===",$("scene3").value,"=== LÉGENDE ===",$("caption").value,"=== HASHTAGS ===",$("hashtags").value].join("\n\n");
  await copyText(all);flash("Tout le pack est copié ✓");
});

$("resetBtn").addEventListener("click",()=>{
  photoInput.value="";preview.src="";preview.hidden=true;dropHint.hidden=false;photoDone.hidden=true;
  analysisResult.value="";updateGenerateState();$("results").hidden=true;
  ["tiktok-pack-photo","tiktok-pack-analysis","tiktok-pack-generated"].forEach(k=>sessionStorage.removeItem(k));
  window.scrollTo({top:0,behavior:"smooth"});
});

(function restore(){
  const p=sessionStorage.getItem("tiktok-pack-photo"),a=sessionStorage.getItem("tiktok-pack-analysis"),g=sessionStorage.getItem("tiktok-pack-generated");
  if(p){preview.src=p;preview.hidden=false;dropHint.hidden=true;photoDone.hidden=false}
  if(a)analysisResult.value=a;
  updateGenerateState();
  if(g){try{const d=JSON.parse(g);["scene1","scene2","scene3","caption","hashtags"].forEach(id=>{if(d[id])$(id).value=d[id]});$("results").hidden=false}catch{}}
})();
