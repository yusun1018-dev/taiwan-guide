/* 샘 · 중국어 공부방 — 30일 계획표 · 하루 다섯 칸 체크(이 기기에만 저장) · 대만 중국어 음성 */
(function(){
  const root=document.getElementById("study"), Z=window.ZH30; if(!root||!Z) return;
  const KEY="zh30.v1", PARTS=[["zy","발음 · 주음",10],["v","어휘",15],["g","문법",10],["l","듣기",10],["s","말하기",15]];
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  let st={}; try{ st=JSON.parse(localStorage.getItem(KEY)||"{}")||{}; }catch(e){ st={}; }
  const save=()=>{ try{ localStorage.setItem(KEY,JSON.stringify(st)); }catch(e){} };
  const cnt=i=>PARTS.filter(p=>st[i+"."+p[0]]).length;

  /* 계획표 */
  const weeks=document.getElementById("zWeeks");
  weeks.innerHTML=Z.weeks.map((w,wi)=>{
    const ds=Z.days.map((d,i)=>[d,i]).filter(([d])=>d.w===wi);
    return `<div class="zweek"><div class="wk"><b>${esc(w[0])} · ${esc(w[1])}</b>${esc(w[2])}</div><div class="dd">${
      ds.map(([d,i])=>`<button type="button" class="zd" data-i="${i}" aria-pressed="false" aria-label="${i+1}일 차 ${esc(d.t)}" title="${i+1}일 · ${esc(d.t)}">${i+1}</button>`).join("")}</div></div>`;
  }).join("");
  const btns=[...weeks.querySelectorAll(".zd")];
  const paint=()=>{
    let all=0;
    btns.forEach(b=>{ const i=+b.dataset.i, c=cnt(i); all+=c;
      b.classList.toggle("done",c===PARTS.length); b.classList.toggle("part",c>0&&c<PARTS.length); b.style.setProperty("--p",(c/PARTS.length*100)+"%"); });
    const days=btns.filter(b=>b.classList.contains("done")).length;
    document.getElementById("zProg").style.width=(all/(PARTS.length*30)*100)+"%";
    document.getElementById("zProgT").textContent=`${days} / 30일 완료`;
  };

  /* 음성 (zh-TW) */
  const SS=window.speechSynthesis, can=!!(SS&&typeof SpeechSynthesisUtterance!=="undefined");
  if(!can) root.classList.add("nosound");
  let voice=null; const pick=()=>{ const v=SS.getVoices(); voice=v.find(x=>/zh[-_]TW/i.test(x.lang))||v.find(x=>/zh[-_](HK|Hant)/i.test(x.lang))||v.find(x=>/^zh/i.test(x.lang))||null; };
  if(can){ pick(); if(SS.onvoiceschanged!==undefined) SS.addEventListener("voiceschanged",pick); }
  let run=0;
  const stop=()=>{ run++; if(can) SS.cancel(); root.querySelectorAll(".say.on").forEach(b=>b.classList.remove("on")); };
  const speak=(btn,rate)=>new Promise(res=>{ const u=new SpeechSynthesisUtterance(btn.dataset.say); u.lang="zh-TW"; if(voice) u.voice=voice; u.rate=rate||.8;
    btn.classList.add("on"); u.onend=u.onerror=()=>{ btn.classList.remove("on"); res(); }; SS.speak(u); });
  const playAll=async(box)=>{ stop(); const me=run; for(const b of box.querySelectorAll(".say")){ if(me!==run) return; await speak(b); await new Promise(r=>setTimeout(r,450)); } };

  /* 하루 보기 */
  const line=(x,who)=>`<li><div>${who?`<div class="who">${who}</div>`:""}<div class="zh" lang="zh-Hant-TW">${esc(x.zh)}</div><div class="py">${esc(x.py)}</div><div class="zy" lang="zh-Hant-TW">${esc(x.zy)}</div><div class="ko">${esc(x.ko)}</div></div><button type="button" class="say" data-say="${esc(x.zh)}" aria-label="${esc(x.zh)} 듣기">▶</button></li>`;
  const day=document.getElementById("zDay"); let cur=0;
  const prompt=(i,d)=>`중국어 대화 연습을 하자. 오늘은 30일 계획 ${i+1}일 차 「${d.t}」 주제야. 내 수준은 초중급이고 대만식 번체 중국어로 하자. 네가 먼저 한 문장으로 말을 걸고, 한 번에 한 문장씩만 답해 줘. 5번 주고받은 뒤 내 실수를 고쳐 주고, 원어민이라면 내 문장을 어떻게 말할지 보여 줘. 오늘 쓰면 좋은 표현: ${d.g.ex.zh} / ${d.v.map(x=>x.zh).join(", ")}`;
  const show=(i,scroll)=>{
    stop(); cur=i; const d=Z.days[i], w=Z.weeks[d.w];
    btns.forEach(b=>b.setAttribute("aria-pressed",String(+b.dataset.i===i)));
    const blk=(k,mn,ttl,body,tg)=>{ const on=!!st[i+"."+k];
      return `<section class="zblk${on?" done":""}" data-k="${k}"><header><label><input type="checkbox"${on?" checked":""}>${ttl}</label><span class="mn">${mn}분</span>${tg||""}</header>${body}</section>`; };
    day.innerHTML=`<div class="dh"><small>DAY ${String(i+1).padStart(2,"0")} · ${esc(w[0])} ${esc(w[1])}</small><h3>${esc(d.t)}</h3></div>`+
      blk("zy",10,"발음 · 주음",`<p class="how">${esc(d.zy)}</p><ul class="zw">${d.zx.map(x=>line(x)).join("")}</ul>`)+
      blk("v",15,"어휘",`<p class="how">듣고 → 세 번 따라 말하고 → 주음만 보고 뜻 떠올리기</p><ul class="zw zv">${d.v.map(x=>line(x)).join("")}</ul>`,`<button type="button" class="tg all">전체 듣기</button>`)+
      blk("g",10,"문법",`<div class="zpat">${esc(d.g.p)}</div><ul class="zw">${line(d.g.ex)}</ul><p class="how" style="margin-top:8px">단어만 바꿔 내 문장 세 개를 소리 내어 만들어 보세요.</p>`)+
      blk("l",10,"듣기",`<p class="how">1회 글 가리고 듣기 → 2회 주음 보며 → 3회 바로 뒤따라 말하기</p><ul class="zw zl hide">${d.l.map((x,j)=>line(x,j?"B":"A")).join("")}</ul>`,`<button type="button" class="tg peek" aria-pressed="false">글 보기</button>`)+
      blk("s",15,"말하기",`<p class="ztask">${esc(d.s)}</p><button type="button" class="zcopy">Claude와 대화 연습 — 시작 문장 복사<small>복사한 뒤 Claude 대화창에 붙여 넣으세요 · 한 문장씩 5번 주고받고 교정</small></button>`)+
      `<div class="znav"><button type="button" data-go="${i-1}"${i?"":" disabled"}>← ${i?`${i}일 차`:""}</button><button type="button" data-go="${i+1}"${i<29?"":" disabled"}>${i<29?`${i+2}일 차`:""} →</button></div>`;
    if(scroll) day.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});
  };
  day.addEventListener("change",e=>{ const s=e.target.closest(".zblk"); if(!s) return; const k=cur+"."+s.dataset.k;
    if(e.target.checked) st[k]=1; else delete st[k]; s.classList.toggle("done",e.target.checked); save(); paint(); });
  day.addEventListener("click",async e=>{
    const t=e.target.closest("button"); if(!t) return;
    if(t.classList.contains("say")){ if(!can) return; stop(); speak(t); }
    else if(t.classList.contains("all")) playAll(t.closest(".zblk"));
    else if(t.classList.contains("peek")){ const l=t.closest(".zblk").querySelector(".zl"); const on=!l.classList.contains("peek"); l.classList.toggle("peek",on); t.setAttribute("aria-pressed",String(on)); t.textContent=on?"글 가리기":"글 보기"; }
    else if(t.classList.contains("zcopy")){ const txt=prompt(cur,Z.days[cur]); let ok=false;
      try{ await navigator.clipboard.writeText(txt); ok=true; }catch(_){ const ta=document.createElement("textarea"); ta.value=txt; document.body.appendChild(ta); ta.select(); try{ ok=document.execCommand("copy"); }catch(__){} ta.remove(); }
      const s=t.querySelector("small"), old=s.textContent; s.textContent=ok?"복사했어요 — Claude 대화창에 붙여 넣으세요":"복사가 막혀 있어요 — 길게 눌러 직접 복사해 주세요"; setTimeout(()=>s.textContent=old,2600); }
    else if(t.dataset.go!==undefined) show(+t.dataset.go,true);
  });
  weeks.addEventListener("click",e=>{ const b=e.target.closest(".zd"); if(b) show(+b.dataset.i,true); });

  paint();
  const next=Z.days.findIndex((d,i)=>cnt(i)<PARTS.length);
  show(next<0?29:next,false);
})();
