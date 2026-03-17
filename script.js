let channels = [];

function parseM3U(){

let text = document.getElementById("input").value;
let lines = text.split("\n");

channels = [];

for(let i=0;i<lines.length;i++){

if(lines[i].startsWith("#EXTINF")){

let info = lines[i];
let url = lines[i+1];

let name = info.split(",")[1];

let groupMatch = info.match(/group-title="([^"]+)"/);
let idMatch = info.match(/tvg-id="([^"]+)"/);

let group = groupMatch ? groupMatch[1] : "";
let epgid = idMatch ? idMatch[1] : "";

channels.push({
name:name,
epgid:epgid,
group:group,
url:url
});

}

}

renderTable();

}

function renderTable(){

let table = document.querySelector("#channels tbody");
table.innerHTML="";

channels.forEach((c,i)=>{

let row = `
<tr>
<td contenteditable="true">${c.name}</td>
<td contenteditable="true">${c.epgid}</td>
<td contenteditable="true">${c.group}</td>
<td>${c.url}</td>
<td id="status-${i}">⏳</td>
</tr>
`;

table.innerHTML += row;

checkStream(c.url,i);

});

}

async function checkStream(url,index){

try{

let response = await fetch(url,{method:"HEAD",mode:"no-cors"});

document.getElementById("status-"+index).innerHTML="🟢";

}catch{

document.getElementById("status-"+index).innerHTML="🔴";

}

}

function downloadM3U(){

let rows = document.querySelectorAll("#channels tbody tr");

let output="#EXTM3U\n";

rows.forEach(row=>{

let name=row.children[0].innerText;
let epgid=row.children[1].innerText;
let group=row.children[2].innerText;
let url=row.children[3].innerText;

output+=`#EXTINF:-1 tvg-id="${epgid}" group-title="${group}",${name}\n`;
output+=`${url}\n`;

});

let blob=new Blob([output],{type:"text/plain"});

let a=document.createElement("a");

a.href=URL.createObjectURL(blob);
a.download="playlist.m3u";
a.click();

}
