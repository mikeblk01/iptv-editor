let lists = [];
let selected = [];

// agregar lista
async function addList(){

let url = document.getElementById("urlInput").value;

let proxy = "https://api.allorigins.win/raw?url=";
let res = await fetch(proxy + encodeURIComponent(url));
let text = await res.text();

let channels = parseM3U(text);

lists.push({url,channels});

renderLists();

}

// parsear M3U
function parseM3U(text){

let lines = text.split("\n");
let ch = [];

for(let i=0;i<lines.length;i++){

if(lines[i].startsWith("#EXTINF")){

let info = lines[i];
let url = lines[i+1];

let name = info.split(",")[1];
let epg = (info.match(/tvg-id="([^"]+)"/)||[])[1]||"";
let group = (info.match(/group-title="([^"]+)"/)||[])[1]||"";
let logo = (info.match(/tvg-logo="([^"]+)"/)||[])[1]||"";

ch.push({name,epg,group,logo,url});

}

}

return ch;

}

// render listas
function renderLists(){

let container = document.getElementById("lists");
container.innerHTML="";

lists.forEach((list,li)=>{

let div = document.createElement("div");

div.innerHTML = `<h3>Lista ${li+1} 
<button onclick="removeList(${li})">❌</button></h3>`;

let table = `<table><tr>
<th>✔</th><th>Nombre</th><th>Grupo</th></tr>`;

list.channels.forEach((c,i)=>{

table += `<tr>
<td><input type="checkbox" onchange="toggleChannel(${li},${i},this)"></td>
<td>${c.name}</td>
<td>${c.group}</td>
</tr>`;

});

table += "</table>";

div.innerHTML += table;
container.appendChild(div);

});

}

// eliminar lista
function removeList(i){
lists.splice(i,1);
renderLists();
}

// seleccionar canal
function toggleChannel(li,ci,el){

let c = lists[li].channels[ci];

if(el.checked){
selected.push({...c});
}else{
selected = selected.filter(x=>x.url !== c.url);
}

renderSelected();

}

// render seleccionados
function renderSelected(){

let table = document.querySelector("#selectedTable tbody");
table.innerHTML="";

selected.forEach((c,i)=>{

table.innerHTML += `
<tr>
<td contenteditable>${c.name}</td>
<td contenteditable>${c.epg}</td>
<td contenteditable>${c.group}</td>
<td contenteditable>${c.logo}</td>
<td>${c.url}</td>
<td id="st-${i}">-</td>
<td><button onclick="removeChannel(${i})">❌</button></td>
</tr>
`;

});

}

// eliminar canal
function removeChannel(i){
selected.splice(i,1);
renderSelected();
}

// agregar manual
function addManual(){

selected.push({
name:"Nuevo canal",
epg:"",
group:"",
logo:"",
url:"http://"
});

renderSelected();

}

// exportar M3U
function exportM3U(){

let out="#EXTM3U\n";

let rows=document.querySelectorAll("#selectedTable tbody tr");

rows.forEach(r=>{

let name=r.children[0].innerText;
let epg=r.children[1].innerText;
let group=r.children[2].innerText;
let logo=r.children[3].innerText;
let url=r.children[4].innerText;

out+=`#EXTINF:-1 tvg-id="${epg}" tvg-logo="${logo}" group-title="${group}",${name}\n`;
out+=url+"\n";

});

let blob=new Blob([out],{type:"text/plain"});
let a=document.createElement("a");
a.href=URL.createObjectURL(blob);
a.download="playlist.m3u";
a.click();

}

// revisar streams
async function checkStream(url,i){

let video=document.createElement("video");
video.src=url;

let timeout=setTimeout(()=>{
video.remove();
document.getElementById("st-"+i).innerHTML="🔴";
},7000);

video.onloadeddata=()=>{
clearTimeout(timeout);
video.remove();
document.getElementById("st-"+i).innerHTML="🟢";
};

video.onerror=()=>{
clearTimeout(timeout);
video.remove();
document.getElementById("st-"+i).innerHTML="🔴";
};

}

// revisar todos
function checkAllStreams(){
selected.forEach((c,i)=>{
document.getElementById("st-"+i).innerHTML="⏳";
checkStream(c.url,i);
});
}
