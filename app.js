async function postJSON(url, data){
  const res = await fetch(url, {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(data)});
  const json = await res.json().catch(()=> ({}));
  return {res, json};
}

function qs(sel){return document.querySelector(sel);}

async function handleDevisForm(){
  const form = qs("#devisForm");
  if(!form) return;

  const msg = qs("#formMsg");
  form.addEventListener("submit", async (e)=>{
    e.preventDefault();
    msg.textContent = "Envoi...";
    msg.className = "msg";

    const data = Object.fromEntries(new FormData(form).entries());
    const {res, json} = await postJSON("/api/devis", data);
    if(!res.ok){
      msg.textContent = json.error || "Erreur.";
      msg.className = "msg err";
      return;
    }
    msg.textContent = "Demande envoyée ✅ (id: " + json.id + ")";
    msg.className = "msg ok";
    form.reset();
  });
}

handleDevisForm();
