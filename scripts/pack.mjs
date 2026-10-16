import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
const names=['package.json','cordis.patch.yml','README.md','LICENSE','lib/index.js','lib/client.js'];
const chunks=[];
function field(header,offset,length,value){header.write(value,offset,Math.min(length,Buffer.byteLength(value)),'utf8');}
for(const name of names){
 const data=fs.readFileSync(path.join(root,name)),header=Buffer.alloc(512);
 field(header,0,100,'package/'+name);field(header,100,8,'0000644\0');field(header,108,8,'0000000\0');field(header,116,8,'0000000\0');field(header,124,12,data.length.toString(8).padStart(11,'0')+'\0');field(header,136,12,'00000000000\0');header.fill(32,148,156);header[156]=48;field(header,257,6,'ustar\0');field(header,263,2,'00');const sum=header.reduce((a,b)=>a+b,0);field(header,148,8,sum.toString(8).padStart(6,'0')+'\0 ');chunks.push(header,data,Buffer.alloc((512-data.length%512)%512));
}
chunks.push(Buffer.alloc(1024));
const out=path.join(root,`${pkg.name}-${pkg.version}.tgz`);fs.writeFileSync(out,zlib.gzipSync(Buffer.concat(chunks),{level:9}));console.log(path.basename(out));
