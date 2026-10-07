(() => {
  const D=window.COFFEEUK_DATA;
  const state={type:"third-wave",method:"v60",profile:"balanced",body:2,acidity:3,sweetness:2,bean:"Colombia Huila",cups:1,step:1};
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const methodImages={v60:"img/method-v60.svg",chemex:"img/method-chemex.svg",aeropress:"img/method-aeropress.svg",french:"img/method-french.svg",kalita:"img/method-kalita.svg",siphon:"img/method-siphon.svg",coldbrew:"img/method-coldbrew.svg",clever:"img/method-clever.svg"};
  const typeIcons={"third-wave":"☕","classic-filter":"◉","espresso":"●","turkish":"☕","moka":"◒","cold":"❄"};
  const profileInfo={fruity:["🍓","Meyvemsi"],floral:["🌸","Çiçeksi"],chocolate:["🍫","Çikolatalı"],sweet:["🍯","Tatlı"],balanced:["⚖️","Dengeli"],bright:["🍊","Canlı"],body:["☕","Gövdesi Yoğun"]};

  function renderTypes(){
    $("#typeGrid").innerHTML=D.coffeeTypes.map(t=>`<button type="button" class="choice type-card ${state.type===t.id?"selected":""}" data-type="${t.id}"><span class="check">✓</span><div class="type-icon">${typeIcons[t.id]||"☕"}</div><strong>${t.name}</strong><small>${t.count}</small><p>${t.desc}</p></button>`).join("");
    $$("[data-type]").forEach(b=>b.onclick=()=>{state.type=b.dataset.type;renderTypes();renderMethods()});
  }
  function renderMethods(){
    const list=D.methods.filter(m=>m.category===state.type);
    if(!list.length)return;
    if(!list.some(m=>m.id===state.method)) state.method=list[0].id;
    $("#methodGrid").innerHTML=list.map(m=>`<button type="button" class="choice ${state.method===m.id?"selected":""}" data-method="${m.id}"><span class="check">✓</span>${methodImages[m.id]?`<img src="${methodImages[m.id]}" alt="${m.name}">`:`<div class="method-symbol">${m.drink||m.name}</div>`}<strong>${m.name}</strong><small>${m.coffee}g / ${m.water}ml</small></button>`).join("");
    $$("[data-method]").forEach(b=>b.onclick=()=>{state.method=b.dataset.method;renderMethods()});
  }
  function renderProfiles(){
    $("#profileGrid").innerHTML=D.profiles.map(p=>{const [emoji,label]=profileInfo[p.id]||["☕",p.name];return `<button type="button" class="choice flavor ${state.profile===p.id?"selected":""}" data-profile="${p.id}"><span class="check">✓</span><div class="emoji">${emoji}</div><strong>${label}</strong></button>`}).join("");
    $$("[data-profile]").forEach(b=>b.onclick=()=>{state.profile=b.dataset.profile;renderProfiles()});
  }
  function renderBeans(){
    $("#beanGrid").innerHTML=D.beans.map(b=>`<button type="button" class="bean ${state.bean===b.name?"selected":""}" data-bean="${b.name}"><strong>${b.name}</strong><small>${b.origin} · ${b.type}</small></button>`).join("");
    $$("[data-bean]").forEach(b=>b.onclick=()=>{state.bean=b.dataset.bean;renderBeans()});
  }
  function renderCups(){
    $$("[data-cups]").forEach(b=>b.onclick=()=>{state.cups=+b.dataset.cups;$$("[data-cups]").forEach(x=>x.classList.toggle("selected",x===b))});
  }
  function setStep(n){
    state.step=n;
    $$(".step-dot").forEach((x,i)=>x.classList.toggle("active",i<n));
    $$(".step-section").forEach((x,i)=>x.hidden=i!==n-1);
    $("#progressText").textContent=`${n} / 6`;
    window.scrollTo({top:$("#recipeApp").offsetTop-8,behavior:"smooth"});
  }
  function openWizard(){
    $("#landing").hidden=true;$(".landing-features").hidden=true;$("#recipeApp").hidden=false;$("#resultScreen").hidden=true;
    renderTypes();renderMethods();renderProfiles();renderBeans();renderCups();setStep(1);
  }
  function recipe(){
    const candidates=D.recipes.filter(r=>r.method_id===state.method);
    let best=candidates[0],bestScore=-Infinity;
    candidates.forEach(r=>{
      let s=0;
      if(r.profile_id===state.profile)s+=10;
      if(r.bean===state.bean)s+=8;
      if(state.profile==="fruity"&&r.tags.includes("kırmızı meyveler"))s+=2;
      if(state.profile==="floral"&&r.tags.includes("yasemin"))s+=2;
      if(state.profile==="chocolate"&&r.tags.includes("kakao"))s+=2;
      if(state.profile==="sweet"&&r.tags.includes("karamel"))s+=2;
      if(state.profile==="bright"&&r.tags.includes("narenciye"))s+=2;
      if(state.profile==="body"&&r.tags.includes("bitter çikolata"))s+=2;
      if(s>bestScore){bestScore=s;best=r}
    });
    const scale=state.cups;
    return {...best,coffee:Math.round(best.coffee*scale),water:Math.round(best.water*scale),ratio:best.ratio};
  }
  function renderResult(){
    const r=recipe();
    $("#result").innerHTML=`<div class="result-photo"><img src="img/hero-coffee.svg" alt="CoffeeUK kahve"></div>
    <div class="result-body"><span class="label">Senin Reçeten · ${state.cups} Fincan</span>
    <h2>${r.bean}</h2><div class="method-line">${r.method} · ${r.profile}</div>
    <div class="tags">${r.tags.map(t=>`<span class="tag">${t}</span>`).join("")}</div>
    <p style="color:var(--muted);line-height:1.7;margin:0">${r.description}</p>
    <div class="metrics"><div class="metric"><small>Kahve</small><b>${r.coffee} g</b></div><div class="metric"><small>Su</small><b>${r.water} ml</b></div><div class="metric"><small>Oran</small><b>1:${r.ratio}</b></div><div class="metric"><small>Sıcaklık</small><b>${r.temp}°C</b></div><div class="metric"><small>Öğütüm</small><b>${r.grind}</b></div><div class="metric"><small>Süre</small><b>${r.time}</b></div></div>
    <div class="pour"><h3>${(D.methods.find(m=>m.id===r.method_id)?.plan?.title)||"Hazırlama Planı"}</h3>${((D.methods.find(m=>m.id===r.method_id)?.plan?.steps)||[]).map(s=>`<div class="pour-step"><b>${s[0]}</b><span>${s[1].replaceAll("{coffee}",r.coffee).replaceAll("{water}",r.water)}</span></div>`).join("")}${D.methods.find(m=>m.id===r.method_id)?.plan?.cold?`<div class="cold-note">${D.methods.find(m=>m.id===r.method_id).plan.cold.replace("2 fincan",`${state.cups} fincan`)}</div>`:""}</div>
    <div class="actions"><button class="secondary" id="saveBtn">♡ Bu Tarifi Kaydet</button><button class="secondary" id="newBtn">↻ Yeni Tarif</button></div></div>`;
    $("#saveBtn").onclick=()=>{localStorage.setItem("coffeeuk_saved",JSON.stringify(r));$("#saveBtn").textContent="✓ Kaydedildi"};
    $("#newBtn").onclick=openWizard;$("#resultScreen").hidden=false;$("#recipeApp").hidden=true;window.scrollTo({top:0,behavior:"smooth"});
  }
  function bind(){
    $("#startBtn").onclick=openWizard;
    $("#backHome").onclick=()=>{$("#recipeApp").hidden=true;$("#resultScreen").hidden=true;$("#landing").hidden=false;$(".landing-features").hidden=false;window.scrollTo({top:0,behavior:"smooth"})};
    $("#backToWizard").onclick=()=>{$("#resultScreen").hidden=true;$("#recipeApp").hidden=false;window.scrollTo({top:0,behavior:"smooth"})};
    $("#newRecipeTop").onclick=openWizard;
    $("#nextType").onclick=()=>setStep(2);$("#next1").onclick=()=>setStep(3);$("#next2").onclick=()=>setStep(4);$("#next3").onclick=()=>setStep(5);$("#next4").onclick=()=>setStep(6);
    $("#generate").onclick=renderResult;
    $("#body").oninput=e=>{state.body=+e.target.value;$("#bodyVal").textContent=["Hafif","Orta","Yoğun"][state.body-1]};
    $("#acidity").oninput=e=>{state.acidity=+e.target.value;$("#acidityVal").textContent=["Düşük","Orta","Yüksek"][state.acidity-1]};
    $("#sweetness").oninput=e=>{state.sweetness=+e.target.value;$("#sweetnessVal").textContent=["Düşük","Orta","Yüksek"][state.sweetness-1]};
  }
  function init(){bind();renderTypes();renderMethods();renderProfiles();renderBeans();renderCups();$("#bodyVal").textContent="Orta";$("#acidityVal").textContent="Yüksek";$("#sweetnessVal").textContent="Orta"}
  document.addEventListener("DOMContentLoaded",init);
})();