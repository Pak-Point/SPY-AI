const API_BASE = "https://spy-ai-video-api.nk7741595.workers.dev";
const imageInput=document.querySelector("#imageInput"),preview=document.querySelector("#preview"),uploadText=document.querySelector("#uploadText"),promptBox=document.querySelector("#prompt"),generate=document.querySelector("#generate"),statusBox=document.querySelector("#status"),video=document.querySelector("#result"),download=document.querySelector("#download");
const imagePrompt=document.querySelector("#imagePrompt"),generateImage=document.querySelector("#generateImage"),imageStatus=document.querySelector("#imageStatus"),imageResult=document.querySelector("#imageResult"),imageDownload=document.querySelector("#imageDownload");
let imageData="";

function apiUrl(path){return API_BASE+path}
function requireApi(){if(!API_BASE){throw new Error("Cloudflare Worker URL ابھی ایپ میں شامل نہیں۔ پہلے API سرور کا اصل URL سیٹ کریں۔")}}

generateImage.addEventListener("click",async()=>{
  const prompt=imagePrompt.value.trim();
  if(!prompt){imageStatus.textContent="براہِ کرم تصویر کا Prompt لکھیں۔";return}
  try{
    requireApi();
    generateImage.disabled=true;imageResult.hidden=true;imageDownload.hidden=true;
    imageStatus.textContent="🍌 تصویر بن رہی ہے… براہِ کرم انتظار کریں۔";
    const r=await fetch(apiUrl("/api/image"),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt})});
    const d=await r.json();
    if(!r.ok)throw new Error(d.error||"تصویر نہیں بن سکی۔");
    if(!d.image)throw new Error("ماڈل نے تصویر واپس نہیں کی۔");
    const src="data:"+(d.mimeType||"image/png")+";base64,"+d.image;
    imageResult.src=src;imageResult.hidden=false;imageDownload.href=src;imageDownload.hidden=false;
    imageStatus.textContent="آپ کی تصویر تیار ہے!";
  }catch(e){imageStatus.textContent="خرابی: "+e.message}
  finally{generateImage.disabled=false}
});

imageInput.addEventListener("change",async()=>{
  const f=imageInput.files?.[0];if(!f)return;
  if(!["image/jpeg","image/png","image/webp"].includes(f.type)){statusBox.textContent="براہِ کرم JPG، PNG یا WEBP تصویر منتخب کریں۔";return}
  if(f.size>10*1024*1024){statusBox.textContent="تصویر 10 MB سے کم ہونی چاہیے۔";return}
  imageData=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(f)});
  preview.src=imageData;preview.hidden=false;uploadText.textContent=f.name;statusBox.textContent="تصویر تیار ہے۔"
});

generate.addEventListener("click",async()=>{
  try{
    requireApi();
    if(!imageData)throw new Error("پہلے تصویر منتخب کریں۔");
    if(!promptBox.value.trim())throw new Error("ویڈیو کے لیے Prompt لکھیں۔");
    generate.disabled=true;video.hidden=true;download.hidden=true;statusBox.textContent="درخواست بھیجی جا رہی ہے…";
    const r=await fetch(apiUrl("/api/generate"),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({image:imageData,prompt:promptBox.value.trim(),duration:Number(document.querySelector("#duration").value),ratio:document.querySelector("#ratio").value,resolution:document.querySelector("#resolution").value})});
    const d=await r.json();if(!r.ok)throw new Error(d.error||"درخواست مکمل نہیں ہوئی");
    if(!d.request_id)throw new Error("Video API نے request ID واپس نہیں دی۔");
    statusBox.textContent="ویڈیو بن رہی ہے… براہِ کرم انتظار کریں۔";
    let done=null;
    for(let i=0;i<90;i++){
      await new Promise(x=>setTimeout(x,5000));
      const p=await fetch(apiUrl("/api/status/"+encodeURIComponent(d.request_id)));
      const s=await p.json();if(!p.ok)throw new Error(s.error||"اسٹیٹس معلوم نہیں ہو سکا");
      if(s.status==="done"||s.status==="completed"){done=s;break}
      if(s.status==="failed"||s.status==="error")throw new Error(s.error||"ویڈیو نہیں بن سکی");
      statusBox.textContent="ویڈیو تیار ہو رہی ہے… ("+(i+1)+")";
    }
    if(!done)throw new Error("وقت زیادہ ہو گیا۔ بعد میں دوبارہ کوشش کریں۔");
    if(!done.video_url)throw new Error("ویڈیو URL موصول نہیں ہوا۔");
    video.src=done.video_url;video.hidden=false;download.href=done.video_url;download.hidden=false;statusBox.textContent="آپ کی ویڈیو تیار ہے!";
  }catch(e){statusBox.textContent="خرابی: "+e.message}
  finally{generate.disabled=false}
});
if("serviceWorker" in navigator && location.protocol.startsWith("http"))navigator.serviceWorker.register("./sw.js").catch(()=>{});
