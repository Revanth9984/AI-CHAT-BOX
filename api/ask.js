//This is a standard Next.js API route declaration. Can be used to make server online

export default async function handler(req,res) {

    res.setHeader("Access-Control-Allow-Origin", "*"); // or specify extension origin
   res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
   res.setHeader("Access-Control-Allow-Headers", "Content-Type");

   if (req.method === "OPTIONS") {
    return res.status(200).end(); // handle preflight
  }
  
    if(req.method!=="POST"){
        return res.status(405).json({error:"Only POST requests allowed"});
    }
    
    let body=req.body;
    if (typeof req.body === "string") {
  try{
       body = JSON.parse(req.body);
    } catch (err) {
       return res.status(400).json({ error: "Invalid JSON format" });
    }
  }
       const {question,pageText} = req.body;
    
    if(!question || !pageText){
        return res.status(400).json({error:"Missing question or pagetext"});
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    try{
        const gptResponse = await fetch("https://api.openai.com/v1/chat/completions",{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    {role:"system", content: "You are a helpful assistant answering questions based on webpage content."},
                    {role:"user", content: `Page Content: ${pageText.substring(0,3000)}\n\n Question:${question}`}
                ],
                max_tokens: 512,
                temperature: 0.7
            })
        })
        //getting response from AI
        const result= await gptResponse.json();
        const aiAnswer= result.choices?.[0]?.message?.content?.trim() || "No answer generated";

        return res.status(200).json({answer: aiAnswer});
    }catch(err){
        console.error("OpenAI API error:", err);
        return res.status(500).json({error: "Failed to fetch from OPENAI"});
    }
}