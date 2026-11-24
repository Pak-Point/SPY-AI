const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET,POST,OPTIONS","Access-Control-Allow-Headers":"Content-Type"};
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{...cors,"Content-Type":"application/json"}})}
function decodeDataUrl(value){
  const m=/^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/.exec(value||"");
  return m?{mimeType:m[1],data:m[2]}:null;
}
export default {async fetch(request,env){
  const url=new URL(request.url);
  if(request.method==="OPTIONS")return new Response(null,{headers:cors});

  // Nano Banana image generation (Gemini API)
  if(url.pathname==="/api/image"&&request.method==="POST"){
    if(!env.GEMINI_API_KEY)return json({error:"Gemini API key is not configured. Add GEMINI_API_KEY as a Cloudflare Secret."},500);
    try{
      const body=await request.json();
      if(typeof body.prompt!=="string"||!body.prompt.trim()||body.prompt.length>2000)return json({error:"Please enter a prompt (maximum 2000 characters)."},400);
      const upstream=await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-nano-banana-2.1:generateContent",{
        method:"POST",
        headers:{"Content-Type":"application/json","x-goog-api-key":env.GEMINI_API_KEY},
        body:JSON.stringify({contents:[{parts:[{text:body.prompt.trim()}]}],generationConfig:{responseModalities:["TEXT","IMAGE"],imageConfig:{aspectRatio:["1:1","9:16","16:9","4:3","3:4"].includes(body.aspectRatio)?body.aspectRatio:"1:1",imageSize:"1K"}}})
      });
      const data=await upstream.json();
      if(!upstream.ok)return json({error:data.error?.message||"Gemini image generation failed."},upstream.status);
      const parts=data.candidates?.[0]?.content?.parts||[];
      const imagePart=parts.find(p=>p.inlineData?.data||p.inline_data?.data);
      const inline=imagePart?.inlineData||imagePart?.inline_data;
      if(!inline?.data)return json({error:"Gemini returned no image. Try another prompt."},502);
      return json({image:inline.data,mimeType:inline.mimeType||inline.mime_type||"image/png"});
    }catch(e){return json({error:e.message||"Image generation request failed."},500)}
  }

  // xAI video generation remains a separate, optional paid API
  if(url.pathname==="/api/generate"&&request.method==="POST"){
    if(!env.XAI_API_KEY)return json({error:"Video API key is not configured. Image generation can work independently with GEMINI_API_KEY."},503);
    try{
      const body=await request.json();
      if(!decodeDataUrl(body.image))return json({error:"Valid JPG, PNG or WEBP image is required."},400);
      if(typeof body.prompt!=="string"||!body.prompt.trim()||body.prompt.length>2000)return json({error:"Prompt is required (maximum 2000 characters)."},400);
      const duration=Math.min(15,Math.max(1,Number(body.duration)||8));
      const resolution=["480p","720p","1080p"].includes(body.resolution)?body.resolution:"720p";
      const upstream=await fetch("https://api.x.ai/v1/videos/generations",{method:"POST",headers:{"Authorization":"Bearer "+env.XAI_API_KEY,"Content-Type":"application/json"},body:JSON.stringify({model:"grok-imagine-video-1.5-lite",prompt:body.prompt,image:{url:body.image},duration,resolution})});
      const data=await upstream.json();
      if(!upstream.ok)return json({error:data.error?.message||data.message||"xAI request failed."},upstream.status);
      return json({request_id:data.request_id});
    }catch(e){return json({error:e.message||"Video request failed."},500)}
  }

  if(url.pathname.startsWith("/api/status/")&&request.method==="GET"){
    if(!env.XAI_API_KEY)return json({error:"Video API key is not configured."},503);
    try{
      const id=url.pathname.split("/").pop();
      if(!id||!/^[a-zA-Z0-9-]+$/.test(id))return json({error:"Valid request ID is required."},400);
      const upstream=await fetch("https://api.x.ai/v1/videos/"+encodeURIComponent(id),{headers:{"Authorization":"Bearer "+env.XAI_API_KEY}});
      const data=await upstream.json();
      if(!upstream.ok)return json({error:data.error?.message||"Could not fetch video status."},upstream.status);
      return json({status:data.status,video_url:data.video?.url||null,error:data.error?.message||null});
    }catch(e){return json({error:e.message||"Status check failed."},500)}
  }
  return json({error:"Not found"},404);
}};
