/* Cały kod jest zamknięty w funkcji (IIFE), żeby nasze nazwy nie zderzały się
   z nazwami, które przeglądarka lub podgląd już mają (to był powód błędu z "T"). */
(function(){
"use strict";

/* 1. TWOJE DANE: edytujesz tylko tutaj. Każdy tekst ma wersję pl i en. */
const text = {
  pl:{
    title:"Kinga | Portfolio",
    hero_title:"Cześć, jestem Kinga.",
    hero_text:"Studentka informatyki. Uczę się tworzyć strony internetowe, od pomysłu po publikację.",
    hero_btn:"Zobacz projekty",
    about:"Mam 23 lata i studiuję informatykę, więc wciąż się uczę. Tworzenie stron to dla mnie forma relaksu, a gotowy efekt daje mi ogromną satysfakcję. Moje główne zainteresowania to gaming, muzyka, kolekcjonerstwo i podróże.",
    projects:"Projekty",
    open:"Otwórz stronę",
    skills_title:"Umiejętności",
    skills_lead:"Dopiero się uczę: od października studiuję informatykę, a strony tworzę we współpracy z Claude AI.",
    contact_title:"Kontakt",
    contact_text:"Masz pomysł na stronę? Napisz:",
    art:"Wzór panterki",
    switch:"Zmień język na angielski"
  },
  en:{
    title:"Kinga | Portfolio",
    hero_title:"Hi, I'm Kinga.",
    hero_text:"Computer science student. I'm learning to build websites, from idea to launch.",
    hero_btn:"See projects",
    about:"I'm 23 years old and I study computer science, so I'm still learning. Building websites is a form of relaxation for me, and the finished result gives me great satisfaction. My main interests are gaming, music, collecting and travel.",
    projects:"Projects",
    open:"Open site",
    skills_title:"Skills",
    skills_lead:"I'm still learning: I started studying computer science in October, and I build websites together with Claude AI.",
    contact_title:"Contact",
    contact_text:"Have an idea for a website? Write to me:",
    art:"Leopard print pattern",
    switch:"Switch language to Polish"
  }
};
const projects = [
  {title:"Burger Cult", url:"https://kikiiq.github.io/burgercult/", tags:"Frontend, Claude AI",
   pl:"Strona burgerowni z kreatorem burgera i licznikiem zajętych stolików.",
   en:"A burger restaurant website with a build-your-own-burger tool and a live count of occupied tables."},
  {title:"O Włos", url:"https://kikiiq.github.io/o_wlos/", tags:"Frontend, Claude AI",
   pl:"Strona salonu fryzjerskiego z kalkulatorem cen i suwakiem przed/po.",
   en:"A hair salon website with a price calculator and a before/after slider."},
  {title:"Tiny Den", url:"https://kikiiq.github.io/tiny_den/", tags:"Frontend, Claude AI",
   pl:"Strona produktywności: lista zadań, Pomodoro i zwierzak-maskotka.",
   en:"A productivity page with a to-do list, a Pomodoro timer and an animal mascot."},
  {title:"Kontur Studio", url:"https://kikiiq.github.io/kontur_studio/", tags:"Frontend, Claude AI",
   pl:"Wielostronicowa strona pracowni architektonicznej z filtrowaniem projektów.",
   en:"A multi-page website for an architecture studio, with project filtering."}
];
const skills = {
  pl:["Praca z Claude AI","WebDev Frontend","Projektowanie stron","GitHub"],
  en:["Working with Claude AI","Frontend web development","Web design","GitHub"]
};

/* 2. BUDOWANIE STRONY Z DANYCH */
const $ = id => document.getElementById(id);
const clamp = (v,a,b) => Math.min(b, Math.max(a, v));
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

// Elementy, które nie zmieniają się przy zmianie języka, budujemy tylko raz
$("nav-links").innerHTML = projects.map(p=>`<a href="${p.url}" target="_blank" rel="noopener">${p.title}</a>`).join("");
$("slides").innerHTML = projects.map((p,i)=>`
  <article class="slide${i%2?" rev":""}">
    <div class="art reveal" role="img" data-art style="background-position-x:${i*150}px"></div>
    <div class="txt reveal" data-lag="0.06"><h3>${p.title}</h3><p data-desc="${i}"></p><span class="tags">${p.tags}</span>
    <a class="btn" href="${p.url}" target="_blank" rel="noopener" data-i="open"></a></div>
  </article>`).join("");
$("skills").innerHTML = skills.pl.map(()=>"<li></li>").join("");

/* "O mnie": każde słowo w osobnym <span>, żeby zapalać je po kolei podczas scrollowania */
let words = [], aboutProgress = 0;
function paintAbout(){
  if(reduce) return;
  words.forEach((w,i)=>{
    const t = aboutProgress*(words.length+2) - i;
    w.style.opacity = .18 + .82*clamp(t,0,1);
  });
}

/* 3. ZMIANA JĘZYKA: podmienia wszystkie teksty bez przeładowania strony */
let lang = "pl";
function applyLang(l){
  lang = l;
  const d = text[l];
  document.documentElement.lang = l;
  document.title = d.title;
  document.querySelectorAll("[data-i]").forEach(el=>{ el.textContent = d[el.dataset.i]; });
  document.querySelectorAll("[data-desc]").forEach(el=>{ el.textContent = projects[el.dataset.desc][l]; });
  document.querySelectorAll("[data-art]").forEach(el=>{ el.setAttribute("aria-label", d.art); });
  document.querySelectorAll("#skills li").forEach((li,i)=>{ li.textContent = skills[l][i]; });
  $("about-text").innerHTML = d.about.split(" ").map(w=>`<span class="w">${w}</span>`).join(" ");
  words = [...$("about-text").querySelectorAll(".w")];
  paintAbout();
  const spans = $("lang").querySelectorAll("span");
  spans[0].classList.toggle("on", l==="pl");
  spans[1].classList.toggle("on", l==="en");
  $("lang").setAttribute("aria-label", d.switch);
}
applyLang("pl");   // strona zawsze startuje po polsku
$("lang").addEventListener("click", ()=>applyLang(lang==="pl" ? "en" : "pl"));

/* 4. ANIMACJE ZWIĄZANE ZE SCROLLEM (bez bibliotek) */
const wrapEl = $("about-wrap");
const arts = [...document.querySelectorAll(".art")];
const reveals = [...document.querySelectorAll(".reveal")];
let ticking = false;

function update(){
  ticking = false;
  if(reduce) return;
  const H = innerHeight;

  // a) "O mnie": jak daleko jesteśmy w wysokim kontenerze (0 = początek, 1 = koniec)
  const r = wrapEl.getBoundingClientRect();
  const total = r.height - H;
  aboutProgress = total > 0 ? clamp(-r.top/total, 0, 1) : 1;
  paintAbout();

  // b) elementy .reveal: przezroczystość i przesunięcie zależą od położenia na ekranie,
  //    więc "wjeżdżają" dokładnie tak szybko, jak przewijasz
  reveals.forEach(el=>{
    const lag = parseFloat(el.dataset.lag) || 0;
    const p = clamp((H*(.92-lag) - el.getBoundingClientRect().top)/(H*.37), 0, 1);
    el.style.opacity = p;
    el.style.transform = p >= 1 ? "" : `translateY(${(1-p)*60}px)`;
  });

  // c) wzór w ramkach projektów przesuwa się wolniej niż strona (efekt głębi)
  arts.forEach(a=>{
    const b = a.getBoundingClientRect();
    const p = clamp((H - b.top)/(H + b.height), 0, 1);
    a.style.backgroundPositionY = `${-p*120}px`;
  });
}
function onScroll(){ if(!ticking){ ticking = true; requestAnimationFrame(update); } }
// capture:true łapie przewijanie także wtedy, gdy strona jest pokazana w ramce (iframe)
document.addEventListener("scroll", onScroll, {capture:true, passive:true});
addEventListener("resize", onScroll);
update();

/* 5. PŁYNNE PRZEWIJANIE (Lenis): opcjonalne, nie włącza się w podglądach w ramkach */
if(!reduce && window.Lenis && window.self === window.top){
  try{
    const lenis = new Lenis({lerp:0.1});
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener("click",e=>{
      const t = document.querySelector(a.getAttribute("href"));
      if(t){ e.preventDefault(); lenis.scrollTo(t, {offset:-60}); }
    }));
  }catch(err){}
}

})();
