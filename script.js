const $ = (id) => document.getElementById(id);
const promptBox = $("prompt"), messagesEl = $("messages"), welcome = $("welcome");
const sendBtn = $("sendBtn"), historyList = $("historyList");
const STORAGE_KEY = "devil_ai_chats_v1";
let chats = loadChats(), activeId = null, busy = false;

function loadChats(){ try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]")}catch{return []} }
function saveChats(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(chats)); renderHistory(); }
function makeId(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
function currentChat(){return chats.find(c=>c.id===activeId)}
function newChat(){activeId=null;messagesEl.innerHTML="";welcome.hidden=false;renderHistory();promptBox.focus();closeSidebar()}
function renderHistory(){
  historyList.innerHTML="";
  [...chats].reverse().forEach(chat=>{
    const b=document.createElement("button");b.className="history-item"+(chat.id===activeId?" active":"");
    b.textContent=chat.title||"New conversation";b.title=b.textContent;
    b.onclick=()=>openChat(chat.id);historyList.appendChild(b);
  });
}
function openChat(id){activeId=id;const chat=currentChat();messagesEl.innerHTML="";welcome.hidden=!!(chat&&chat.messages.length);if(chat)chat.messages.forEach(m=>drawMessage(m.role,m.content));renderHistory();closeSidebar();}
function drawMessage(role,content){
  const row=document.createElement("div");row.className="message "+(role==="user"?"user":"assistant");
  const avatar=document.createElement("div");avatar.className="avatar";avatar.textContent=role==="user"?"Y":"D";
  const bubble=document.createElement("div");bubble.className="bubble";bubble.textContent=content;
  row.append(avatar,bubble);messagesEl.appendChild(row);$("conversation").scrollTop=$("conversation").scrollHeight;return row;
}
function showTyping(){const row=drawMessage("assistant","");const bubble=row.querySelector(".bubble");bubble.innerHTML='<span class="typing"><i></i><i></i><i></i></span>';return row;}
async function sendMessage(text){
  text=text.trim();if(!text||busy)return;
  if(!activeId){activeId=makeId();chats.push({id:activeId,title:text.slice(0,38),messages:[]});}
  const chat=currentChat();chat.messages.push({role:"user",content:text});welcome.hidden=true;drawMessage("user",text);promptBox.value="";resizeInput();busy=true;sendBtn.disabled=true;const typing=showTyping();
  try{
    const response=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:chat.messages.slice(-20)})});
    const data=await response.json();if(!response.ok)throw new Error(data.error||"Request failed");
    const answer=(data.reply||"I couldn't create a response. Please try again.").trim();
    typing.remove();chat.messages.push({role:"assistant",content:answer});drawMessage("assistant",answer);
  }catch(err){
    typing.remove();const msg="I couldn't connect to DEVIL CORE. "+(err.message||"Please try again.");chat.messages.push({role:"assistant",content:msg});drawMessage("assistant",msg);
  }finally{busy=false;sendBtn.disabled=false;saveChats();promptBox.focus();}
}
function resizeInput(){promptBox.style.height="auto";promptBox.style.height=Math.min(promptBox.scrollHeight,150)+"px";}
function closeSidebar(){$("sidebar").classList.remove("open");$("scrim").classList.remove("show");}
sendBtn.addEventListener("click",()=>sendMessage(promptBox.value));
promptBox.addEventListener("input",resizeInput);
promptBox.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage(promptBox.value)}});
$("newChat").addEventListener("click",newChat);
$("clearBtn").addEventListener("click",()=>{if(!activeId){newChat();return;}chats=chats.filter(c=>c.id!==activeId);newChat();saveChats();});
$("menuBtn").addEventListener("click",()=>{$("sidebar").classList.add("open");$("scrim").classList.add("show")});
$("closeSidebar").addEventListener("click",closeSidebar);$("scrim").addEventListener("click",closeSidebar);
document.querySelectorAll(".suggestion").forEach(b=>b.addEventListener("click",()=>sendMessage(b.dataset.prompt)));
renderHistory();
if(chats.length){const last=chats[chats.length-1];openChat(last.id);}
if("serviceWorker" in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("/sw.js").catch(()=>{}));}
