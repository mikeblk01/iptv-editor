let allChannels = [];

async function loadFromURL(){

let url = document.getElementById("urlInput").value;

let res = await fetch(url);
let text = await res.text();

parseM3U(text);

}

function parseM3U(text){

let lines = text.split("\n");
allChannels = [];

for(let i=0;i<lines.length;i++){

if(lines[i].startsWith("#EXTINF")){

let info = lines[i];
let url = lines[i+1];

let name = info.split(",")[1];

let epg = (info.match(/tvg-id="([^"]+)"/)||[])[1] || "";
let group = (info.match(/group-title="([^"]+)"/)||[])[1] || "";
let logo = (info.match(/tvg-logo="([^"]+)"/)||[])[1] || "";

allChannels.push({name,epg,group,logo,url});

}

}

render();

}

function render(){

let table = document.querySelector("#channels tbody");
table.innerHTML="";

allChannels.forEach((c,i)=>{

table.innerHTML += `
<tr>
<td><input type="checkbox" id="sel-${i}"></td>
<td contenteditable>${c.name}</td>
<td contenteditable>${c.epg}</td>
<td contenteditable>${c.group}</td>
<td contenteditable>${c.logo}</td>
<td>${c.url}</td>
</tr>
`;

});

}

function exportConfig(){

let rows = document.querySelectorAll("#channels tbody tr");

let selected = [];

rows.forEach((row,i)=>{

let checked = row.querySelector("input").checked;

if(checked){

selected.push({
name: row.children[1].innerText,
epg: row.children[2].innerText,
group: row.children[3].innerText,
logo: row.children[4].innerText,
url: row.children[5].innerText
});

}

});

downloadJSON(selected);

}

function downloadJSON(data){

let blob = new Blob([JSON.stringify(data,null,2)],{type:"application/json"});

let a = document.createElement("a");

a.href = URL.createObjectURL(blob);
a.download = "config.json";
a.click();

}
