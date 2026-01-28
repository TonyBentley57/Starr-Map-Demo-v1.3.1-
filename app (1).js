
(function(){
  // --- No-JS banner control
  const nojs = document.getElementById('nojs');
  if(nojs) nojs.classList.add('hidden');

  function escapeHtml(str){
    try{ return String(str).replace(/[&<>"']/g, (m)=>({"&":"&amp;","<":"&lt;",">":"&gt;",""":"&quot;","'":"&#39;"}[m])); }
    catch{ return ''; }
  }
  function showError(msg){
    const bar = document.getElementById('errorBar');
    if(bar){ bar.textContent = msg || 'Something went wrong in the demo. Please try again.'; bar.style.display='block'; }
    console.error(msg);
  }
  function safe(fn){
    try{ fn(); }
    catch(e){ showError('Demo error (v1.3.2 SAFE‑EXT). See console for details.'); console.error(e); }
  }

  const state = {
    screenOrder:["landing","student-welcome","emotion","energy","body","need","tools","send","sent"],
    current: "landing",
    emotions: new Set(),
    energy: null,
    body: new Set(),
    needs: new Set(),
    shareLevel: "need_only",
    studentName: "",
    simplified: false,
    reducedMotion: false,
    toolPage: 0,
    toolOpen: false,
    toolKey: null,
    toolStep: 0,
  };

  const EMOTIONS_STD = [
    {id:"happy", label:"Happy", emoji:"🙂"},
    {id:"okay", label:"Okay", emoji:"😐"},
    {id:"worried", label:"Worried", emoji:"😟"},
    {id:"sad", label:"Sad", emoji:"😢"},
    {id:"frustrated", label:"Frustrated", emoji:"😤"},
    {id:"overwhelmed", label:"Overwhelmed", emoji:"🌀"},
    {id:"tired", label:"Tired", emoji:"😴"},
    {id:"energetic", label:"Energetic", emoji:"⚡"},
  ];
  const EMOTIONS_SIMPLE = EMOTIONS_STD.slice(0,6);

  const ENERGY = [
    {id:"very_low", label:"Very low", emoji:"⬇️"},
    {id:"low", label:"Low", emoji:"🐢"},
    {id:"okay", label:"Okay", emoji:"🙂"},
    {id:"high", label:"High", emoji:"⚡"},
    {id:"very_high", label:"Very high", emoji:"🚀"},
  ];

  const BODY_STD = [
    {id:"tight_chest", label:"Tight chest", emoji:"🤏"},
    {id:"fast_heart", label:"Fast heartbeat", emoji:"❤️"},
    {id:"butterflies", label:"Butterflies", emoji:"🦋"},
    {id:"stomach_swirl", label:"Stomach feels off", emoji:"🌀"},
    {id:"shaky", label:"Shaky", emoji:"🫨"},
    {id:"tense", label:"Tense muscles", emoji:"💪"},
    {id:"hot", label:"Hot", emoji:"🔥"},
    {id:"cold", label:"Cold", emoji:"❄️"},
    {id:"head_pressure", label:"Head pressure", emoji:"💭"},
    {id:"heavy", label:"Heavy / low energy", emoji:"🪨"},
    {id:"fidgety", label:"Fidgety", emoji:"👣"},
    {id:"dizzy", label:"Lightheaded", emoji:"🌀"},
  ];
  const BODY_SIMPLE = ["tight_chest","fast_heart","shaky","tense","heavy","fidgety","dizzy","cold"].map(id=> BODY_STD.find(b=>b.id===id));

  const NEEDS = [
    {id:"break", label:"A short break"},
    {id:"help", label:"Help with the work"},
    {id:"move", label:"Move my body"},
    {id:"quiet", label:"Quiet / less noise"},
    {id:"water", label:"Water / bathroom"},
    {id:"talk", label:"Talk to someone"},
    {id:"ok", label:"I’m okay (just checking in)"},
  ];

  const TOOLS = {
    // CALM
    calm_feet_roots:{title:"Feet Roots",duration:"~20s",steps:["Stand tall; press feet into the floor for 5 seconds.","Let go and breathe out.","Repeat once."],coach:"Imagine your feet growing roots into the ground.",category:"calm"},
    calm_shoulder_melt:{title:"Shoulder Melt",duration:"~30s",steps:["Lift shoulders up to ears.","Slowly roll them back and down.","Exhale; let your jaw relax."],coach:"Drop your shoulders like melting ice.",category:"calm"},
    calm_self_hug:{title:"Self‑Hug Squeeze",duration:"~20s",steps:["Cross arms and hug yourself.","Squeeze gently for 5 seconds.","Release and notice your breath."],coach:"A quick hug can tell your body you’re safe.",category:"calm"},
    calm_desk_press:{title:"Desk Press",duration:"~20s",steps:["Place palms under desk edge.","Press up for 5 seconds.","Release slowly; repeat once."],coach:"Quiet strength helps settle busy energy.",category:"calm"},
    calm_box_breath:{title:"Square Breath",duration:"~1 min",steps:["Inhale 4.","Hold 4.","Exhale 4.","Hold 4 (repeat)."],coach:"If breath feels tricky, choose a non‑breathing tool instead.",category:"calm"},
    calm_54321:{title:"5‑4‑3‑2‑1 Senses",duration:"~1 min",steps:["Name 5 things you see.","4 you feel.","3 you hear.","2 you smell, 1 you like."],coach:"Go slow; noticing brings you back to now.",category:"calm"},
    calm_cool_touch:{title:"Cool Touch",duration:"~20s",steps:["Hold something cool (bottle/desk).","Feel the temperature on your skin.","Relax your shoulders."],coach:"Cool can help your body shift gears.",category:"calm"},
    calm_cloud_stretch:{title:"Cloud Stretch",duration:"~30s",steps:["Reach both arms up like touching a cloud.","Side bend left; breathe.","Side bend right; breathe."],coach:"Long, slow stretches calm muscles and mind.",category:"calm"},
    calm_eye_rest:{title:"Eye Rest",duration:"~20s",steps:["Look at something far away.","Soften your eyes.","Blink slowly 5 times."],coach:"Soft eyes can lower body tension.",category:"calm"},
    calm_hand_warm:{title:"Hand Warmers",duration:"~30s",steps:["Rub your hands together.","Cup them over cheeks.","Breathe out slowly."],coach:"Warmth sends a relax message.",category:"calm"},
    calm_anchored_seat:{title:"Anchored Seat",duration:"~30s",steps:["Sit tall; feet flat.","Press feet and legs gently into chair.","Exhale and unclench your hands."],coach:"Feel the chair holding you up.",category:"calm"},
    calm_turtle_shell:{title:"Turtle Shell",duration:"~30s",steps:["Cross arms over chest.","Tuck chin a little; round back.","Breathe and slowly sit up tall."],coach:"Like a turtle: in, then out again when ready.",category:"calm"},

    // ENERGIZE
    en_jump_springs:{title:"Bouncy Jumps",duration:"~20s",steps:["Stand in your space.","Do 10 light hops in place.","Shake arms and smile."],coach:"Small bounces wake up your body.",category:"energize"},
    en_march_power:{title:"Power March",duration:"~30s",steps:["March in place; knees up.","Swing arms gently.","Count 20 steps."],coach:"Strong steps = strong focus.",category:"energize"},
    en_air_dribble:{title:"Air Dribble",duration:"~20s",steps:["Pretend to dribble a ball.","Switch hands every 3 taps."],coach:"Quick hands wake up your brain.",category:"energize"},
    en_cross_crawl:{title:"Cross‑Crawls",duration:"~30s",steps:["Right elbow to left knee.","Left elbow to right knee.","Go slow for 10 taps."],coach:"Crossing midline can boost attention.",category:"energize"},
    en_shake_it:{title:"Shake It Out",duration:"~20s",steps:["Shake hands 5.","Shake arms 5.","Shake legs 5."],coach:"Release extra wiggles fast.",category:"energize"},
    en_sky_reach:{title:"Sky Reach",duration:"~20s",steps:["Reach up tall.","Tip‑toe for 5 seconds.","Drop heels gently."],coach:"A quick stretch can spark energy.",category:"energize"},
    en_toe_taps:{title:"Toe‑Tap Tempo",duration:"~20s",steps:["Tap toes under desk.","Make a steady beat (count to 20)."],coach:"Quiet beat, big energy.",category:"energize"},
    en_desk_drums:{title:"Desk Drum Beats",duration:"~20s",steps:["Tap a simple 1‑2, 1‑2 rhythm.","Fade to softer taps."],coach:"Start loud, finish calm.",category:"energize"},
    en_face_wakeup:{title:"Wake‑Up Face",duration:"~20s",steps:["Scrunch face tight.","Open eyes wide; relax jaw."],coach:"Two scrunch‑and‑relax cycles wake you up.",category:"energize"},
    en_alphabet_air:{title:"Alphabet Air Draw",duration:"~30s",steps:["Draw A‑B‑C in the air with your finger.","Switch hands if you want."],coach:"Big air letters = big movement.",category:"energize"},
    en_step_touches:{title:"Side Step‑Touch",duration:"~30s",steps:["Step right; touch left to it.","Step left; touch right.","Repeat 10 times."],coach:"Gentle cardio without leaving your spot.",category:"energize"},
    en_power_pose:{title:"Power Pose",duration:"~20s",steps:["Feet wide; hands on hips.","Lift chest; breathe in/out."],coach:"Posture can power up confidence.",category:"energize"},

    // FOCUS
    foc_laser_look:{title:"Laser Look",duration:"~30s",steps:["Pick one object.","Name 3 details out loud or in your head.","Blink slowly once."],coach:"Focusing on one thing quiets the rest.",category:"focus"},
    foc_finger_taps:{title:"Finger Taps",duration:"~20s",steps:["Tap thumb to each finger.","Switch hands."],coach:"Small patterns steady your brain.",category:"focus"},
    foc_box_trace:{title:"Box‑Trace Breath",duration:"~1 min",steps:["Trace a square on desk.","Inhale on side 1; hold side 2; exhale side 3; hold side 4."],coach:"Tracing gives your breath a path.",category:"focus"},
    foc_anchor_object:{title:"Anchor Object",duration:"~30s",steps:["Hold a safe object (pencil).","Feel its weight and texture."],coach:"Anchors help your attention stay put.",category:"focus"},
    foc_word_whisper:{title:"Word Whisper",duration:"~20s",steps:["Repeat the key instruction quietly 3 times.","Start the first step."],coach:"Quiet repetition = clear action.",category:"focus"},
    foc_three_plan:{title:"3‑Step Plan",duration:"~30s",steps:["Name step 1.","Name step 2.","Name step 3."],coach:"A tiny plan turns big tasks doable.",category:"focus"},
    foc_color_scan:{title:"Color Scan",duration:"~30s",steps:["Find 5 blue things.","Now 5 green things."],coach:"Hunting for colors sharpens focus.",category:"focus"},
    foc_number_hunt:{title:"Number Hunt",duration:"~30s",steps:["Find 3 numbers around you.","Say them in order."],coach:"A quick search narrows attention.",category:"focus"},
    foc_sound_sort:{title:"Sound Sort",duration:"~30s",steps:["Pause and listen.","Name 1 close sound, 1 far sound."],coach:"Sorting sounds helps filter noise.",category:"focus"},
    foc_pointer_pause:{title:"Pointer Pause",duration:"~20s",steps:["Point your finger at your work spot.","Keep it there for 5 seconds; begin."],coach:"A tiny pause points your focus.",category:"focus"},
    foc_slow_count:{title:"Slow Count 10",duration:"~20s",steps:["Count 1…10 slowly.","On 10, start the next step."],coach:"Counting slows racing thoughts.",category:"focus"},
    foc_eye_trace:{title:"Eye Trace Line",duration:"~20s",steps:["Draw a short line on paper.","Trace it with your eyes 5 times."],coach:"Eye tracking brings your mind to the page.",category:"focus"},
  };

  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  function goto(screen){
    state.current = screen;
    $$('[data-screen]').forEach(sec=> sec && sec.classList.add('hidden'));
    const target = $(`[data-screen="${screen}"]`);
    if(target) target.classList.remove('hidden');
    updateNav();
    safe(render);
  }

  function updateNav(){
    const idx = state.screenOrder.indexOf(state.current);
    const backBtn = $('#backBtn');
    const prevBtn = $('#prevBtn');
    const skipBtn = $('#skipBtn');
    const nextBtn = $('#nextBtn');
    if(backBtn) backBtn.disabled = (idx<=0);
    if(prevBtn) prevBtn.disabled = (idx<=0);
    const unskippable = new Set(["need","tools","send","sent"]);
    if(skipBtn) skipBtn.disabled = unskippable.has(state.current);
    let disableNext = false;
    if(state.current==="need" && state.needs.size===0) disableNext = true;
    if(state.current==="send") disableNext = false;
    if(nextBtn){ nextBtn.disabled = disableNext; nextBtn.textContent = (state.current==="send"? "Send" : "Next"); }
  }

  function tile(el, selected){ if(el) el.setAttribute('aria-pressed', String(!!selected)); }

  function render(){
    document.body.classList.toggle('simplified', !!state.simplified);
    document.body.classList.toggle('reduced', !!state.reducedMotion);

    // Emotions
    if(state.current==="emotion"){
      const data = state.simplified? EMOTIONS_SIMPLE: EMOTIONS_STD;
      const grid = $('#emotionGrid'); if(grid){ grid.innerHTML='';
        data.forEach(item=>{
          const btn = document.createElement('button');
          btn.className='tile'; btn.setAttribute('role','button'); btn.setAttribute('aria-label', item.label);
          const selected = state.emotions.has(item.id);
          btn.innerHTML = `<div class="emoji">${item.emoji}</div><div>${state.simplified? '' : item.label}</div>`;
          tile(btn, selected);
          btn.addEventListener('click', ()=>{ selected? state.emotions.delete(item.id): state.emotions.add(item.id); safe(()=>render()); });
          grid.appendChild(btn);
        });
      }
    }

    // Energy
    if(state.current==="energy"){
      const grid = $('#energyGrid'); if(grid){ grid.innerHTML='';
        ENERGY.forEach(item=>{
          const btn = document.createElement('button');
          btn.className='tile'; btn.setAttribute('role','button'); btn.setAttribute('aria-label', item.label);
          const selected = state.energy===item.id;
          btn.innerHTML = `<div class="emoji">${item.emoji}</div><div>${item.label}</div>`;
          tile(btn, selected);
          btn.addEventListener('click', ()=>{ state.energy = (state.energy===item.id? null: item.id); safe(()=>render()); });
          grid.appendChild(btn);
        });
      }
    }

    // Body
    if(state.current==="body"){
      const data = state.simplified? BODY_SIMPLE: BODY_STD;
      const grid = $('#bodyGrid'); if(grid){ grid.innerHTML='';
        data.forEach(item=>{
          if(!item) return;
          const btn = document.createElement('button');
          btn.className='tile'; btn.setAttribute('role','button'); btn.setAttribute('aria-label', item.label);
          const selected = state.body.has(item.id);
          btn.innerHTML = `<div class="emoji">${item.emoji}</div><div>${state.simplified? '' : item.label}</div>`;
          tile(btn, selected);
          btn.addEventListener('click', ()=>{ selected? state.body.delete(item.id): state.body.add(item.id); safe(()=>render()); });
          grid.appendChild(btn);
        });
      }
    }

    // Needs (up to 3)
    if(state.current==="need"){
      const list = $('#needList'); if(list){ list.innerHTML='';
        NEEDS.forEach(n=>{
          const selected = state.needs.has(n.id);
          const item = document.createElement('button');
          item.className='chip'; item.setAttribute('role','checkbox'); item.setAttribute('aria-checked', String(selected));
          item.innerHTML = `<span>${n.label}</span><span class="muted">${selected? '✓' : '›'}</span>`;
          item.addEventListener('click', ()=>{
            if(selected){ state.needs.delete(n.id); }
            else{ if(state.needs.size<3) state.needs.add(n.id); else toast('You can pick up to 3.'); }
            updateNav(); safe(()=>render());
          });
          list.appendChild(item);
        });
      }
    }

    // Tools (8 at a time; dynamic by energy)
    if(state.current==="tools"){
      const wrap = $('#toolCards'); if(wrap){ wrap.innerHTML='';
        const keysByCat = Object.entries(TOOLS).reduce((acc,[k,v])=>{ (acc[v.category]??=([])).push(k); return acc; },{});
        const calm = (keysByCat.calm||[]);
        const energize = (keysByCat.energize||[]);
        const focus = (keysByCat.focus||[]);
        let order = [];
        switch(state.energy){
          case 'very_high':
          case 'high': order = [...calm, ...focus, ...energize]; break;
          case 'very_low':
          case 'low': order = [...energize, ...focus, ...calm]; break;
          case 'okay':
          default: {
            const maxLen = Math.max(calm.length, energize.length, focus.length);
            for(let i=0;i<maxLen;i++){ if(calm[i]) order.push(calm[i]); if(energize[i]) order.push(energize[i]); if(focus[i]) order.push(focus[i]); }
          }
        }
        if(order.length===0){ order = Object.keys(TOOLS); }
        const pageSize = 8;
        const start = order.length? (state.toolPage*pageSize) % order.length : 0;
        const extended = order.concat(order);
        const show = extended.slice(start, start+pageSize);
        show.forEach(id=>{
          const t = TOOLS[id]; if(!t) return;
          const card = document.createElement('button');
          card.className='card'; card.style.textAlign='left';
          card.setAttribute('aria-label', `${t.title}, ${t.duration}`);
          card.innerHTML = `
            <div class="row" style="justify-content:space-between; align-items:center">
              <div class="title" style="margin:0">${t.title}</div>
              <div class="pill">${t.duration}</div>
            </div>
          `;
          card.addEventListener('click', ()=> openTool(id));
          wrap.appendChild(card);
        });
      }
    }

    // Share / Preview
    if(state.current==="send"){
      const radios = document.querySelectorAll('input[name="share"]');
      radios.forEach(r=>{ r.checked = (r.value===state.shareLevel); r.onchange = ()=>{ state.shareLevel = r.value; safe(()=>render()); }; });
      const nameRow = $('#nameRow'); if(nameRow) nameRow.style.display = (state.shareLevel==='nothing')? 'none' : 'flex';
      const preview = $('#previewCard'); if(preview){
        const needLabels = Array.from(state.needs).map(id=> (NEEDS.find(n=>n.id===id)||{}).label).filter(Boolean);
        const emoLabels = Array.from(state.emotions).map(id=> (EMOTIONS_STD.find(e=>e.id===id)||EMOTIONS_SIMPLE.find(e=>e.id===id)||{}).label).filter(Boolean);
        const bodyLabels = Array.from(state.body).map(id=> (BODY_STD.find(b=>b.id===id)||BODY_SIMPLE.find(b=>b.id===id)||{}).label).filter(Boolean);
        const energyLabel = (ENERGY.find(e=>e.id===state.energy)||{}).label;
        let html = '';
        if(state.shareLevel==='nothing'){
          html = `<div class="muted">You chose not to share details.</div>`;
        } else if(state.shareLevel==='need_only'){
          html = `<div class="list">
            <div><strong>Need(s):</strong> ${needLabels.length? needLabels.join(', '): '—'}</div>
            ${state.studentName? `<div><strong>Name:</strong> ${escapeHtml(state.studentName)}</div>`: ''}
          </div>`;
        } else {
          html = `<div class="list">
            <div><strong>Need(s):</strong> ${needLabels.length? needLabels.join(', '): '—'}</div>
            <div><strong>Feeling(s):</strong> ${emoLabels.length? emoLabels.join(', '): '—'}</div>
            <div><strong>Body:</strong> ${bodyLabels.length? bodyLabels.join(', '): '—'}</div>
            <div><strong>Energy:</strong> ${energyLabel||'—'}</div>
            ${state.studentName? `<div><strong>Name:</strong> ${escapeHtml(state.studentName)}</div>`: ''}
          </div>`;
        }
        preview.innerHTML = html;
      }
    }
  }

  let toastEl; function toast(msg){
    if(!toastEl){ toastEl=document.createElement('div'); Object.assign(toastEl.style,{position:'fixed',left:'50%',bottom:'24px',transform:'translateX(-50%)',background:'#fff',border:'2px solid rgba(30,42,56,.12)',borderRadius:'12px',padding:'10px 14px',boxShadow:'var(--shadow)',zIndex:9}); document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.remove('hidden'); setTimeout(()=> toastEl.classList.add('hidden'), 1600);
  }

  const toolModal = document.getElementById('toolModal');
  const toolTitle = document.getElementById('toolTitle');
  const toolDuration = document.getElementById('toolDuration');
  const toolSteps = document.getElementById('toolSteps');
  const toolCoach = document.getElementById('toolCoach');

  function openTool(key){ const t=TOOLS[key]; if(!t) return; state.toolOpen=true; state.toolKey=key; state.toolStep=0; if(toolTitle) toolTitle.textContent=t.title; if(toolDuration) toolDuration.textContent=t.duration; renderToolStep(); if(toolModal){ toolModal.classList.remove('hidden'); setTimeout(()=>{ const first=toolSteps? toolSteps.querySelector('li'):null; if(first) first.focus(); }, 10);} }
  function closeTool(){ state.toolOpen=false; state.toolKey=null; if(toolModal) toolModal.classList.add('hidden'); }
  function renderToolStep(){ const t=TOOLS[state.toolKey]; if(!t || !toolSteps) return; toolSteps.innerHTML=''; t.steps.forEach((s,i)=>{ const li=document.createElement('li'); li.tabIndex=0; li.textContent=s; if(i===state.toolStep){ li.style.fontWeight='700'; } toolSteps.appendChild(li); }); if(toolCoach) toolCoach.textContent=t.coach||''; const prevBtn=$('#toolPrev'), nextBtn=$('#toolNext'); if(prevBtn) prevBtn.disabled = state.toolStep<=0; if(nextBtn) nextBtn.disabled = state.toolStep >= (t.steps.length-1); }

  const prevToolBtn = document.getElementById('toolPrev'); if(prevToolBtn) prevToolBtn.addEventListener('click', ()=>{ if(state.toolStep>0){ state.toolStep--; renderToolStep(); }});
  const nextToolBtn = document.getElementById('toolNext'); if(nextToolBtn) nextToolBtn.addEventListener('click', ()=>{ const t=TOOLS[state.toolKey]; if(t && state.toolStep < t.steps.length-1){ state.toolStep++; renderToolStep(); }});
  const doneToolBtn = document.getElementById('toolDone'); if(doneToolBtn) doneToolBtn.addEventListener('click', ()=>{ closeTool(); toast('Nice job. When you’re ready, go to Next.'); });
  window.addEventListener('keydown', (e)=>{ if(!state.toolOpen) return; if(e.key==='ArrowRight'){ e.preventDefault(); const b=document.getElementById('toolNext'); if(b) b.click(); } if(e.key==='ArrowLeft'){ e.preventDefault(); const b=document.getElementById('toolPrev'); if(b) b.click(); } if(e.key==='Escape'){ e.preventDefault(); closeTool(); }});

  function next(){
    const idx = state.screenOrder.indexOf(state.current);
    const nextId = state.screenOrder[idx+1] || state.current;
    if(state.current==="send"){ goto('sent'); return; }
    goto(nextId);
  }
  function prev(){ const idx=state.screenOrder.indexOf(state.current); const prevId=state.screenOrder[idx-1]||state.current; goto(prevId); }

  const nextBtn = document.getElementById('nextBtn'); if(nextBtn) nextBtn.addEventListener('click', ()=> safe(next));
  const prevBtn = document.getElementById('prevBtn'); if(prevBtn) prevBtn.addEventListener('click', ()=> safe(prev));
  const skipBtn = document.getElementById('skipBtn'); if(skipBtn) skipBtn.addEventListener('click', ()=>{ if(state.current==="emotion") goto('energy'); else if(state.current==="energy") goto('body'); else if(state.current==="body") goto('need'); });
  const backBtn = document.getElementById('backBtn'); if(backBtn) backBtn.addEventListener('click', ()=> safe(prev));

  document.querySelectorAll('[data-nav]').forEach(b=> b.addEventListener('click', ()=> goto(b.dataset.nav)));
  const bodyDontKnow = document.getElementById('bodyDontKnow'); if(bodyDontKnow) bodyDontKnow.addEventListener('click', ()=>{ state.body.clear(); safe(next); });

  // Transparency modal
  const tModal = document.getElementById('transparencyModal');
  const openTrans = document.getElementById('openTransparency'); if(openTrans) openTrans.addEventListener('click', ()=> tModal && tModal.classList.remove('hidden'));
  const closeTrans = document.getElementById('closeTransparency'); if(closeTrans) closeTrans.addEventListener('click', ()=> tModal && tModal.classList.add('hidden'));

  // Settings modal
  const sModal = document.getElementById('settingsModal');
  const openSettings = document.getElementById('settingsBtn'); if(openSettings) openSettings.addEventListener('click', ()=> sModal && sModal.classList.remove('hidden'));
  const closeSettings = document.getElementById('closeSettings'); if(closeSettings) closeSettings.addEventListener('click', ()=> sModal && sModal.classList.add('hidden'));
  const toggleSimplified = document.getElementById('toggleSimplified'); if(toggleSimplified) toggleSimplified.addEventListener('change', e=>{ state.simplified = !!e.target.checked; safe(render); });
  const toggleReduced = document.getElementById('toggleReduced'); if(toggleReduced) toggleReduced.addEventListener('change', e=>{ state.reducedMotion = !!e.target.checked; safe(render); });
  const quickHide = document.getElementById('quickHide'); if(quickHide) quickHide.addEventListener('click', ()=>{ state.emotions.clear(); state.body.clear(); state.needs.clear(); state.energy=null; state.shareLevel='need_only'; state.studentName=''; const nm=document.getElementById('studentName'); if(nm) nm.value=''; goto('landing'); sModal && (sModal.classList.add('hidden')); });

  // Name input
  const studentName = document.getElementById('studentName'); if(studentName) studentName.addEventListener('input', (e)=>{ state.studentName = e.target.value||''; safe(render); });

  // Tools more
  const toolsMore = document.getElementById('toolsMore'); if(toolsMore) toolsMore.addEventListener('click', ()=>{ state.toolPage++; safe(render); });

  // Start safely
  safe(()=> goto('landing'));
})();
