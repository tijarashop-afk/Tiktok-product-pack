const $ = (id) => document.getElementById(id);

const CTA = "Disponible sur mon stand et sur Vinted — abonne-toi pour découvrir mes prochains produits !";
const HISTORY_KEY = "tiktok-veo-pack-history-v1";
const MAX_HISTORY = 12;

const photoInput = $("photoInput");
const preview = $("preview");
const dropHint = $("dropHint");
const photoDone = $("photoDone");
const productTitle = $("productTitle");
const analysisResult = $("analysisResult");
const analysisPrompt = $("analysisPrompt");
const copyAnalysisBtn = $("copyAnalysisBtn");
const generateBtn = $("generateBtn");
const status = $("status");

function makeAnalysisPrompt() {
  const title = productTitle.value.trim() || "incertain";
  return `Analyse uniquement la photo jointe de ce produit pour préparer 3 vidéos TikTok de 8 secondes destinées en priorité à gagner des abonnés et des commentaires.\n\nTITRE FOURNI PAR LE VENDEUR : ${title}\n\nRÈGLES ABSOLUES :\n- Le titre ci-dessus est une information fournie par le vendeur. Tu peux l'utiliser comme nom du produit, mais n'en déduis aucune caractéristique supplémentaire.\n- N'affiche, ne demande et n'invente JAMAIS le prix.\n- N'invente pas de marque, matière, dimensions, fonctions, bénéfices ou promesses invisibles/non confirmés.\n- Si une information est incertaine, écris « incertain ».\n- Le produit sera présenté sur un stand et sur Vinted.\n- Le format final sera composé de 3 vidéos verticales de 8 secondes à assembler.\n- Les prompts finaux seront destinés aux modèles Veo de création vidéo de Google.\n- La voix off française doit pouvoir être générée avec chaque vidéo.\n- AUCUNE MUSIQUE dans les 3 vidéos.\n- Le ton doit être naturel, dynamique et non agressivement publicitaire.\n- Objectif n°1 : arrêter le scroll, faire regarder jusqu'au bout, provoquer un commentaire, puis obtenir un abonnement.\n- N'ajoute pas de texte marketing non justifié.\n\nRéponds en français avec exactement ces rubriques :\nPRODUIT :\nDÉTAILS VISIBLES :\nANGLE LE PLUS FORT :\nHOOK VISUEL :\nQUESTION À POSER EN COMMENTAIRE :\nPUBLIC PROBABLE :\nMOTS À ÉVITER / INCERTITUDES :\nIDÉE DE MISE EN SCÈNE :`;
}

function updateAnalysisPrompt(){
  analysisPrompt.value = makeAnalysisPrompt();
  copyAnalysisBtn.disabled = !(productTitle.value.trim() && preview.src);
}

function updateGenerateState(){
  generateBtn.disabled = !(productTitle.value.trim() && analysisResult.value.trim());
}

productTitle.addEventListener("input",()=>{updateAnalysisPrompt();updateGenerateState();});
analysisResult.addEventListener("input",updateGenerateState);
analysisResult.addEventListener("paste",()=>setTimeout(updateGenerateState,0));

photoInput.addEventListener("change", () => {
  const file = photoInput.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    preview.src = reader.result;
    preview.hidden = false;
    dropHint.hidden = true;
    photoDone.hidden = false;
    updateAnalysisPrompt();
  };
  reader.readAsDataURL(file);
});

function flash(message){
  status.textContent=message;
  clearTimeout(flash.timer);
  flash.timer=setTimeout(()=>{if(status.textContent===message)status.textContent=""},2300);
}

async function copyText(text){
  try{await navigator.clipboard.writeText(text)}
  catch{const t=document.createElement("textarea");t.value=text;document.body.appendChild(t);t.select();document.execCommand("copy");t.remove()}
}

copyAnalysisBtn.addEventListener("click",async()=>{
  const prompt=makeAnalysisPrompt();
  analysisPrompt.value=prompt;
  await copyText(prompt);
  const old=copyAnalysisBtn.textContent;copyAnalysisBtn.textContent="✓ Analyse copiée";
  setTimeout(()=>copyAnalysisBtn.textContent=old,1400);
  flash("Joins la même photo dans ChatGPT puis colle l’instruction.");
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
function safeTitle(){return stripPrices(productTitle.value.trim())||"Produit"}

function veoBase(product, details){
  return `Format vertical 9:16. Durée exacte : 8 secondes. Vidéo réaliste de type TikTok, pensée pour mobile. Utiliser la photo de référence pour conserver fidèlement l’apparence, les couleurs, les proportions et les détails visibles du produit. Ne pas ajouter d’objet, de logo, de texte de marque ou de caractéristique absente. Produit : ${product}. Détails autorisés : ${details}. Aucun prix à l’image ni dans la voix. AUDIO : voix off française indiquée ci-dessous, éventuellement sons naturels très discrets du produit si pertinents, mais AUCUNE MUSIQUE, aucun jingle, aucune bande-son musicale.`;
}


function extractVoice(prompt){
  const m=String(prompt||"").match(/VOIX OFF[^:]*:\s*\n«([^»]+)»/i);
  return m?m[1].trim():"";
}

function captionProfile(){
  const style=$("captionStyle")?.value||"social";
  if(style==="hype") return {style,groupSize:2,font:"Heavy condensed 800-900",size:"72-96px",animation:"scale-pop + karaoke + accent glow",energy:"high"};
  if(style==="clean") return {style,groupSize:4,font:"Clean sans 600-700",size:"56-72px",animation:"fade + slide + karaoke subtil",energy:"medium"};
  return {style,groupSize:3,font:"Rounded sans 700-800",size:"56-80px",animation:"bounce/elastic + karaoke mot par mot",energy:"medium-high"};
}

function estimateCaptionGroups(text,sceneIndex){
  const words=String(text||"").trim().split(/\s+/).filter(Boolean);
  if(!words.length)return[];
  const profile=captionProfile();
  const groups=[];
  const sceneStart=(sceneIndex-1)*8;
  const activeStart=sceneStart+.35;
  const activeDuration=7.1;
  const count=Math.ceil(words.length/profile.groupSize);
  for(let i=0;i<count;i++){
    const chunk=words.slice(i*profile.groupSize,(i+1)*profile.groupSize);
    const start=activeStart+(activeDuration/count)*i;
    const end=activeStart+(activeDuration/count)*(i+1);
    groups.push({
      scene:sceneIndex,
      text:chunk.join(" "),
      start:Number(start.toFixed(2)),
      end:Number(end.toFixed(2)),
      timing:"estimé — à resynchroniser sur le TTS final"
    });
  }
  return groups;
}

function getHyperframesPayload(){
  const voices=[1,2,3].map(i=>extractVoice($("scene"+i)?.value||""));
  const profile=captionProfile();
  const intensity=$("effectsIntensity")?.value||"high";
  const captions=voices.flatMap((v,i)=>estimateCaptionGroups(v,i+1));
  return {
    version:"viralapp-hyperframes-v1",
    format:{width:1080,height:1920,aspect:"9:16",duration:24,fps:30},
    visualIdentity:{
      mood:"TikTok produit dynamique, lisible, mobile-first",
      canvas:"dark",
      colors:{background:"#08090c",card:"#14161c",text:"#f7f8fa",accent:"#54f59a"},
      typography:"sans-serif épaisse et très lisible",
      avoid:["texte trop près des bords","plans surchargés","prix","musique","jump cuts"]
    },
    tts:{
      engine:"Kokoro-82M via HyperFrames",
      language:"fr-fr",
      voiceSelection:"choisir une voix française disponible avec npx hyperframes tts --list (identifiant de langue f)",
      scenes:[
        {scene:1,start:0,end:8,speed:1.12,text:voices[0]},
        {scene:2,start:8,end:16,speed:1.04,text:voices[1]},
        {scene:3,start:16,end:24,speed:1.0,text:voices[2]}
      ]
    },
    captions:{
      profile,
      position:"lower-middle, centré, zone sûre portrait",
      maxWidth:900,
      oneGroupAtATime:true,
      hardKillAtGroupEnd:true,
      sync:"transcrire les WAV TTS avec HyperFrames pour obtenir les timestamps mot à mot définitifs",
      groups:captions
    },
    effects:{
      intensity,
      baseline:"karaoke mot par mot",
      emphasis:["nom produit","mots émotionnels","CTA","STAND","VINTED","ABONNE-TOI"],
      markerEffects:intensity==="high"?["highlight sweep","circle","burst"]:intensity==="low"?["highlight subtil"]:["highlight sweep","circle"],
      transitions:[
        {at:7.7,type:"cover/reveal",rule:"la scène 1 reste visible jusqu'à la transition"},
        {at:15.7,type:"push/reveal",rule:"la scène 2 reste visible jusqu'à la transition"}
      ],
      sceneEntrances:"chaque élément entre avec une animation distincte",
      exitRule:"aucune animation de sortie avant les transitions ; sortie autorisée seulement sur la scène finale",
      music:false
    },
    source:{
      product:safeTitle(),
      veoClips:["veo-1.mp4","veo-2.mp4","veo-3.mp4"]
    }
  };
}

function buildHyperframesPack(){
  if(!$("hyperframesBrief"))return;
  const p=getHyperframesPayload();
  const voices=p.tts.scenes.map(s=>s.text);
  $("hyperframesBrief").value=
`HYPERFRAMES — VIRALAPP TIKTOK
Format : 1080×1920 · 9:16 · 24 secondes · 30 fps

OBJECTIF
Assembler les 3 clips Veo de 8 s en une vidéo TikTok fluide, sans musique, avec voix off française, sous-titres dynamiques et effets de rétention.

ASSETS
- veo-1.mp4 : HOOK
- veo-2.mp4 : PRODUIT / COMMENTAIRE
- veo-3.mp4 : CTA

IDENTITÉ VISUELLE
- Fond sombre premium : #08090c
- Texte principal : #f7f8fa
- Accent : #54f59a
- Typographie sans-serif épaisse et lisible
- Conserver une zone sûre : aucun texte collé aux bords
- Ne jamais afficher de prix

MOTION
- Entrée animée pour chaque élément
- Transition cover/reveal vers 7,7 s
- Transition push/reveal vers 15,7 s
- Pas d'animation de sortie avant les transitions
- Dernière scène : fade final autorisé
- Intensité : ${p.effects.intensity}

CAPTIONS
- Style : ${p.captions.profile.style}
- Animation : ${p.captions.profile.animation}
- Groupes courts, un seul groupe visible à la fois
- Karaoke mot par mot ; accent vert sur mots importants
- Resynchroniser les timestamps sur les WAV TTS finaux

AUDIO
- TTS français Kokoro-82M via HyperFrames
- AUCUNE MUSIQUE
- Sons naturels du produit uniquement s'ils existent déjà dans les clips

RÈGLE FINALE
Le produit doit rester le héros. Les effets servent la rétention et la lisibilité, sans inventer de caractéristique ni de promesse.`;

  $("ttsScript").value=
`MOTEUR : Kokoro-82M via HyperFrames
LANGUE : fr-fr
VOIX : choisir une voix française disponible avec « npx hyperframes tts --list »

SCÈNE 1 · vitesse 1.12
${voices[0]||"(voix non détectée)"}

SCÈNE 2 · vitesse 1.04
${voices[1]||"(voix non détectée)"}

SCÈNE 3 · vitesse 1.00
${voices[2]||"(voix non détectée)"}

WORKFLOW :
1. Générer scene1.wav, scene2.wav et scene3.wav avec HyperFrames TTS.
2. Transcrire chaque WAV avec HyperFrames pour récupérer les timestamps mot à mot.
3. Remplacer les timings estimés du plan captions par les timings réels.`;

  $("captionsPlan").value=JSON.stringify({
    style:p.captions.profile,
    position:p.captions.position,
    maxWidth:p.captions.maxWidth,
    groups:p.captions.groups
  },null,2);

  $("effectsPlan").value=JSON.stringify(p.effects,null,2);
}

function previewFrenchTts(){
  if(!("speechSynthesis" in window)){flash("Préécoute vocale non disponible sur ce navigateur.");return}
  window.speechSynthesis.cancel();
  const text=[1,2,3].map(i=>extractVoice($("scene"+i)?.value||"")).filter(Boolean).join(" ... ");
  if(!text){flash("Génère d'abord les prompts.");return}
  const utter=new SpeechSynthesisUtterance(text);
  utter.lang="fr-FR";
  utter.rate=1.05;
  const voices=window.speechSynthesis.getVoices();
  const fr=voices.find(v=>/^fr/i.test(v.lang));
  if(fr)utter.voice=fr;
  window.speechSynthesis.speak(utter);
  flash("Préécoute TTS française lancée ▶");
}

function downloadHyperframesManifest(){
  const payload=getHyperframesPayload();
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url;
  a.download=(safeTitle().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9-_]+/g,"-").replace(/^-+|-+$/g,"").toLowerCase()||"viralapp")+"-hyperframes.json";
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),500);
  flash("Manifeste HyperFrames téléchargé ✓");
}

function buildPack(){
  if(!productTitle.value.trim()){flash("Ajoute le titre du produit.");return}
  if(!analysisResult.value.trim()){flash("Colle d’abord l’analyse de ChatGPT.");return}

  const title=safeTitle();
  const product=field("PRODUIT",title)||title;
  const details=field("DÉTAILS VISIBLES","montrer uniquement les détails réellement visibles");
  const angle=field("ANGLE LE PLUS FORT","mettre en avant le détail visuel le plus intrigant");
  const hook=field("HOOK VISUEL","commencer par un gros plan immédiat et lisible du produit");
  const question=field("QUESTION À POSER EN COMMENTAIRE","Tu le choisirais, toi ?");
  const staging=field("IDÉE DE MISE EN SCÈNE","mouvement court, naturel et lisible sur mobile");

  $("scene1").value=`PROMPT VEO 1/3 — HOOK\n${veoBase(product,details)}\n\nMISE EN SCÈNE :\n0–2 s : ${hook}. Le produit doit être compris immédiatement. Cadrage serré, mouvement caméra très court, aucun écran d’introduction.\n2–6 s : montrer ${angle}, avec ${staging}.\n6–8 s : terminer sur un plan intrigant qui donne envie de regarder la partie suivante sans inventer de fonction.\n\nVOIX OFF FRANÇAISE, naturelle et énergique :\n« Attends… regarde bien ce détail. Tu avais déjà vu ça ? »\n\nTEXTE ÉCRAN COURT : « TU AVAIS VU ÇA ? »\nAUCUNE MUSIQUE. Aucun prix. Aucune promesse inventée.`;

  $("scene2").value=`PROMPT VEO 2/3 — PRODUIT + COMMENTAIRE\n${veoBase(product,details)}\n\nMISE EN SCÈNE :\n0–3 s : reprendre immédiatement le même produit sous un angle visuel différent mais cohérent avec la première vidéo.\n3–6 s : montrer le détail le plus intéressant parmi les éléments réellement visibles : ${angle}. Ne simuler un usage que s’il est clairement démontrable à partir de la photo et de l’analyse.\n6–8 s : stabiliser le cadre sur le produit et laisser une courte respiration visuelle pour favoriser le commentaire.\n\nVOIX OFF FRANÇAISE, naturelle :\n« Le détail que je préfère, c’est celui-là. Et toi, tu en penses quoi ? »\n\nTEXTE ÉCRAN : « TU VALIDES ? 👇 »\nQUESTION À SUSCITER : « ${question} »\nAUCUNE MUSIQUE. Aucun prix. Aucune caractéristique inventée.`;

  $("scene3").value=`PROMPT VEO 3/3 — CTA\n${veoBase(product,details)}\n\nMISE EN SCÈNE :\n0–2 s : beau plan final, propre et lisible du produit. Afficher la question « ${question} » sans masquer le produit.\n2–8 s : conserver le produit visible avec un mouvement très léger et faire entendre le CTA complet à un débit naturel.\n\nVOIX OFF FRANÇAISE, naturelle et souriante :\n« ${CTA} »\n\nTEXTE ÉCRAN FINAL :\n« STAND + VINTED »\n« ABONNE-TOI POUR LES PROCHAINS 👀 »\nAUCUNE MUSIQUE. Aucun prix. Aucun argument de vente inventé.`;

  $("caption").value=`${title} 👀\n${question}\n\n${CTA}`;
  const tag="#"+title.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9]/g,"").slice(0,24);
  const tags=[tag.length>1?tag:"#Trouvaille","#Trouvaille","#VintedFrance","#PetitCommerce","#PourToi"];
  $("hashtags").value=tags.join(" ");

  buildHyperframesPack();
  runChecks();
  $("results").hidden=false;
  saveHistory();
  renderHistory();
  $("results").scrollIntoView({behavior:"smooth",block:"start"});
  flash("3 prompts Veo créés ✓");
}

generateBtn.addEventListener("click",buildPack);

$("generateHyperframesBtn")?.addEventListener("click",()=>{buildHyperframesPack();flash("Pack HyperFrames généré ✓")});
$("captionStyle")?.addEventListener("change",buildHyperframesPack);
$("effectsIntensity")?.addEventListener("change",buildHyperframesPack);
$("previewTtsBtn")?.addEventListener("click",previewFrenchTts);
$("copyHyperframesBtn")?.addEventListener("click",async()=>{
  buildHyperframesPack();
  const txt=["=== HYPERFRAMES ===",$("hyperframesBrief").value,"=== TTS ===",$("ttsScript").value,"=== CAPTIONS ===",$("captionsPlan").value,"=== EFFETS ===",$("effectsPlan").value].join("\n\n");
  await copyText(txt);flash("Pack HyperFrames copié ✓");
});
$("downloadHyperframesBtn")?.addEventListener("click",()=>{buildHyperframesPack();downloadHyperframesManifest()});

function wordCountVoice(prompt){
  const m=prompt.match(/VOIX OFF[^:]*:\s*\n«([^»]+)»/i);
  return m?m[1].trim().split(/\s+/).length:0;
}
function hasPrice(text){return /\b\d+(?:[.,]\d+)?\s*(?:€|euros?)\b/i.test(text)||/\b(?:prix|tarif)\s*[:=-]?\s*\d/i.test(text)}
function runChecks(){
  const prompts=[$("scene1").value,$("scene2").value,$("scene3").value];
  const all=prompts.join("\n");
  const hashtagCount=($("hashtags").value.match(/#[^\s#]+/g)||[]).length;
  const voiceOk=prompts.every(p=>{const n=wordCountVoice(p);return n>0&&n<=24});
  const noMusic=prompts.every(p=>/AUCUNE MUSIQUE/i.test(p));
  const checks=[
    {ok:prompts.length===3,label:"3 clips × 8 s"},
    {ok:!hasPrice(all+"\n"+$("caption").value),label:"Aucun prix"},
    {ok:noMusic,label:"Aucune musique"},
    {ok:voiceOk,label:"Voix off ≤ 8 s"},
    {ok:hashtagCount===5,label:"5 hashtags"},
    {ok:prompts.every(p=>/9:16/.test(p)),label:"Vertical 9:16"},
    {ok:prompts.every(p=>/Veo/i.test(p)),label:"Prompts Veo"},
    {ok:/stand/i.test($("scene3").value)&&/Vinted/i.test($("scene3").value),label:"CTA stand + Vinted"}
  ];
  $("checks").innerHTML=checks.map(c=>`<div class="check ${c.ok?"ok":"bad"}"><span class="check-icon">${c.ok?"✓":"!"}</span><span>${c.label}</span></div>`).join("");
}

function getHistory(){try{return JSON.parse(localStorage.getItem(HISTORY_KEY)||"[]")}catch{return[]}}
function setHistory(items){try{localStorage.setItem(HISTORY_KEY,JSON.stringify(items.slice(0,MAX_HISTORY)))}catch{}}
function saveHistory(){
  const item={id:Date.now(),title:safeTitle(),created:new Date().toISOString(),analysis:analysisResult.value,scene1:$("scene1").value,scene2:$("scene2").value,scene3:$("scene3").value,caption:$("caption").value,hashtags:$("hashtags").value};
  const items=getHistory().filter(x=>x.title!==item.title||x.analysis!==item.analysis);
  setHistory([item,...items]);
}
function renderHistory(){
  const items=getHistory();
  $("historySection").hidden=!items.length;
  $("historyList").innerHTML=items.map(item=>`<div class="history-item"><div><strong>${escapeHtml(item.title)}</strong><small>${new Date(item.created).toLocaleString("fr-FR",{dateStyle:"short",timeStyle:"short"})}</small></div><button type="button" data-history-id="${item.id}">Ouvrir</button></div>`).join("");
  document.querySelectorAll("[data-history-id]").forEach(btn=>btn.addEventListener("click",()=>loadHistory(Number(btn.dataset.historyId))));
}
function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]))}
function loadHistory(id){
  const item=getHistory().find(x=>x.id===id);if(!item)return;
  productTitle.value=item.title;analysisResult.value=item.analysis||"";
  ["scene1","scene2","scene3","caption","hashtags"].forEach(k=>$(k).value=item[k]||"");
  updateAnalysisPrompt();updateGenerateState();buildHyperframesPack();runChecks();$("results").hidden=false;$("results").scrollIntoView({behavior:"smooth",block:"start"});
}
$("clearHistoryBtn").addEventListener("click",()=>{setHistory([]);renderHistory()});

function copyHandler(button){button.addEventListener("click",async()=>{const target=$(button.dataset.target);await copyText(target.value);const old=button.textContent;button.textContent="✓ Copié";setTimeout(()=>button.textContent=old,1200)})}
document.querySelectorAll(".copy-video,.copy-extra").forEach(copyHandler);

$("copyAllBtn").addEventListener("click",async()=>{
  buildHyperframesPack();
  const all=["=== VEO 1 ===",$("scene1").value,"=== VEO 2 ===",$("scene2").value,"=== VEO 3 ===",$("scene3").value,"=== LÉGENDE ===",$("caption").value,"=== HASHTAGS ===",$("hashtags").value,"=== HYPERFRAMES ===",$("hyperframesBrief").value,"=== TTS ===",$("ttsScript").value,"=== CAPTIONS ===",$("captionsPlan").value,"=== EFFETS ===",$("effectsPlan").value].join("\n\n");
  await copyText(all);flash("Pack Veo complet copié ✓");
});

$("resetBtn").addEventListener("click",()=>{
  window.speechSynthesis?.cancel();
  productTitle.value="";photoInput.value="";preview.src="";preview.hidden=true;dropHint.hidden=false;photoDone.hidden=true;analysisResult.value="";$("results").hidden=true;
  ["hyperframesBrief","ttsScript","captionsPlan","effectsPlan"].forEach(id=>{if($(id))$(id).value=""});
  updateAnalysisPrompt();updateGenerateState();window.scrollTo({top:0,behavior:"smooth"});
});

updateAnalysisPrompt();updateGenerateState();renderHistory();
