let channels = [];

async function loadList(){

let url = document.getElementById("urlInput").value;

let proxy = "https://api.allorigins.win/raw?url=";

let res = await fetch(proxy + encodeURIComponent(url));
let text = await res.text();

parseM3U(text);

}

function parseM3U(text){

let lines = text.split("\n");

for(let i=0;i<lines.length;i++){

if(lines[i].startsWith("#EXTINF")){

let info = lines[i];
let url = lines[i+1];

let name = info.split(",")[1];

let epg = (info.match(/tvg-id="([^"]+)"/)||[])[1] || "";
let group = (info.match(/group-title="([^"]+)"/)||[])[1] || "";
let logo = (info.match(/tvg-logo="([^"]+)"/)||[])[1] || "";

channels.push({name,epg,group,logo,url,status:"⏳"});

}

}

render();

}

function render(){

let table = document.querySelector("#channels tbody");
table.innerHTML="";

channels.forEach((c,i)=>{

table.innerHTML += `
<tr>
<td><input type="checkbox" data-i="${i}"></td>
<td contenteditable>${c.name}</td>
<td contenteditable>${c.epg}</td>
<td contenteditable>${c.group}</td>
<td contenteditable>${c.logo}</td>
<td>${c.url}</td>
<td id="status-${i}">${c.status}</td>
</tr>
`;

});

}

function selectAll(){

document.querySelectorAll("input[type=checkbox]").forEach(cb=>{
cb.checked = true;
});

}

function removeSelected(){

let newList = [];

document.querySelectorAll("#channels tbody tr").forEach((row,i)=>{

let checked = row.querySelector("input").checked;

if(!checked){
newList.push(channels[i]);
}

});

channels = newList;
render();

}

function addManual(){

channels.push({
name:"Nuevo Canal",
epg:"",
group:"Manual",
logo:"",
url:"http://",
status:""
});

render();

}

async function checkStream(url,index){

let video = document.createElement("video");

video.src = url;
video.muted = true;

let timeout = setTimeout(()=>{
document.getElementById("status-"+index).innerHTML="🔴";
video.remove();
},7000);

video.onloadeddata = ()=>{
clearTimeout(timeout);
document.getElementById("status-"+index).innerHTML="🟢";
video.remove();
};

video.onerror = ()=>{
clearTimeout(timeout);
document.getElementById("status-"+index).innerHTML="🔴";
video.remove();
};

}

function checkAll(){

channels.forEach((c,i)=>{
checkStream(c.url,i);
});

}

function exportM3U(){

let rows = document.querySelectorAll("#channels tbody tr");

let output = "#EXTM3U\n";

rows.forEach(row=>{

let name=row.children[1].innerText;
let epg=row.children[2].innerText;
let group=row.children[3].innerText;
let logo=row.children[4].innerText;
let url=row.children[5].innerText;

output+=`#EXTINF:-1 tvg-id="${epg}" tvg-logo="${logo}" group-title="${group}",${name}\n`;
output+=`${url}\n`;

});

let blob=new Blob([output],{type:"text/plain"});

let a=document.createElement("a");
a.href=URL.createObjectURL(blob);
a.download="playlist.m3u";
a.click();

}
