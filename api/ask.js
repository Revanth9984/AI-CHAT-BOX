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
       const {question,pageText} = body;
    console.log(question,pageText);
    if(!question || !pageText){
        return res.status(400).json({error:"Missing question or pagetext"});
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if(!GROQ_API_KEY){
        return res.status(500).json({error:"Missing API key"});
    }
    try{
        const gptResponse = await fetch("https://api.groq.com/openai/v1/chat/completions",{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: "llama3-8b-8192",
                messages: [
                    {role:"system", content: "I will be giving the web page content and question asked by user. If You find the relevant answer to the question in the webpage content return it ,if not search the web and answer it. while answering dont mention wheather the answer is based on webpage content or web search"},
                    {role:"user", content: `Page Content: ${pageText.substring(0,3000)}\n\n Question:${question}`}
                ],
                max_tokens: 512,
                temperature: 0.7
            })
        })
        //getting response from AI
        const result= await gptResponse.json();
        if(result.error){
            console.log(result.error.message);
        }
        const aiAnswer= result.choices?.[0]?.message?.content?.trim() || "No answer generated";

        return res.status(200).json({answer: aiAnswer});
    }catch(err){
        console.error("OpenAI API error:", err);
        return res.status(500).json({error: "Failed to fetch from OPENAI"});
    }
}
// "You are a helpful assistant answering questions based on webpage content.And if you are unable to find answer to the user question in the webpage content , serch the web and give the answer."