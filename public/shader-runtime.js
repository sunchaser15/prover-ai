(function () {
  const vertex = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
  const quad = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);

  const heroFragment = `
precision highp float;
uniform vec2 r;
uniform float t;
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
float seg(vec3 p,vec3 a,vec3 b){vec3 ab=b-a,ap=p-a;float h=clamp(dot(ap,ab)/dot(ab,ab),0.,1.);return length(ap-ab*h);}
float boxEdges(vec3 p){
  vec3 a=vec3(-1.),b=vec3(1.);float d=99.;
  d=min(d,seg(p,vec3(a.x,a.y,a.z),vec3(b.x,a.y,a.z)));
  d=min(d,seg(p,vec3(b.x,a.y,a.z),vec3(b.x,b.y,a.z)));
  d=min(d,seg(p,vec3(b.x,b.y,a.z),vec3(a.x,b.y,a.z)));
  d=min(d,seg(p,vec3(a.x,b.y,a.z),vec3(a.x,a.y,a.z)));
  d=min(d,seg(p,vec3(a.x,a.y,b.z),vec3(b.x,a.y,b.z)));
  d=min(d,seg(p,vec3(b.x,a.y,b.z),vec3(b.x,b.y,b.z)));
  d=min(d,seg(p,vec3(b.x,b.y,b.z),vec3(a.x,b.y,b.z)));
  d=min(d,seg(p,vec3(a.x,b.y,b.z),vec3(a.x,a.y,b.z)));
  d=min(d,seg(p,vec3(a.x,a.y,a.z),vec3(a.x,a.y,b.z)));
  d=min(d,seg(p,vec3(b.x,a.y,a.z),vec3(b.x,a.y,b.z)));
  d=min(d,seg(p,vec3(b.x,b.y,a.z),vec3(b.x,b.y,b.z)));
  d=min(d,seg(p,vec3(a.x,b.y,a.z),vec3(a.x,b.y,b.z)));
  return d;
}
vec3 grad(float x){vec3 a=vec3(.75,0.,1.),b=vec3(1.,.4,0.),c=vec3(0.,1.,.8);x=fract(x);return x<.333?mix(a,b,x*3.):x<.666?mix(b,c,(x-.333)*3.):mix(c,a,(x-.666)*3.);}
void main(){
  vec2 uv=(gl_FragCoord.xy-.5*r)/min(r.x,r.y);uv*=.58;uv.x-=.18;
  vec3 ro=vec3(0,0,4.05),rd=normalize(vec3(uv,-1.35));
  float z=0.;vec3 p;float hit=0.,edge=0.;
  for(int i=0;i<80;i++){
    p=ro+rd*z;
    vec3 q=p;q.xy=rot(t*.31)*q.xy;q.xz=rot(t*.23)*q.xz;
    float d1=boxEdges(q)-.045;
    vec3 q2=p-vec3(.9,-.9,0.);q2.xy=rot(-t*.28)*q2.xy;q2.xz=rot(t*.19)*q2.xz;
    float d2=boxEdges(q2)-.045;edge=min(d1,d2);
    if(edge<.001){hit=1.;break;} if(z>12.)break; z+=edge;
  }
  vec3 col=vec3(0.);
  if(hit>.5){float g=(p.x+p.y+p.z)*.15+t*.22;col=grad(g);col+=pow(1.-abs(dot(normalize(p-ro),vec3(0,0,-1))),2.)*.2;}
  gl_FragColor=vec4(col,1.);
}`;

  const antigravityFragment = `
precision highp float;
uniform vec2 r,m;
uniform float t,w;
vec2 hash22(vec2 p){vec3 p3=fract(vec3(p.xyx)*vec3(.1031,.1107,.1030));p3+=dot(p3,p3.yzx+33.33);return fract((p3.xx+p3.yz)*p3.zy)-.5;}
float hash12(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}
vec3 hsl(float h,float s,float l){float c=(1.-abs(2.*l-1.))*s;float x=c*(1.-abs(mod(h/60.,2.)-1.));float mm=l-c/2.;vec3 rgb=h<60.?vec3(c,x,0):h<120.?vec3(x,c,0):h<180.?vec3(0,c,x):h<240.?vec3(0,x,c):h<300.?vec3(x,0,c):vec3(c,0,x);return rgb+mm;}
void main(){
  vec2 uv=gl_FragCoord.xy;vec3 col=vec3(2./255.,3./255.,2./255.);
  float spacing=77.,rad=282.,base=4.,tt=t*.5,hue=mod(tt*76.,360.);
  float wr=-99.;if(w>0.){float age=t-w,tar=rad/200.;wr=age<tar+1.5?age*200.:rad-((age-(tar+1.5))*200.);}
  vec2 cg=floor(uv/spacing);
  for(int x=-2;x<=2;x++){for(int y=-2;y<=2;y++){
    vec2 id=cg+vec2(float(x),float(y));float ph=hash12(id)*6.2831;vec2 c=(id+vec2(.5))*spacing+hash22(id)*spacing*.35;
    c+=vec2(sin(tt*1.8+ph),cos(tt*1.35+ph*1.7))*spacing*.09;
    float d=length(c-m),wb=0.;if(wr>0.){float df=abs(d-wr);if(df<35.){float f=1.-df/35.;wb=f*f*.056;}}
    float sk=.7+hash12(id+5.)*.6,pulse=.78+.22*sin(tt*4.2+ph),rx=0.,ry=0.,a=.05;
    if(d<=rad){float v=d/rad,sv=v*v*(3.-2.*v),sz=base*sk*(.2+sv*1.8)*pulse*(1.+wb);rx=sz*1.6;ry=sz*.55;a=(sv*.85+.08)*(1.+wb*.7);}
    else{float pr=d-rad;if(pr>=180.){rx=4.*(1.+wb);ry=rx;a=.05+wb*.6;}else{float f=1.-pr/180.,sr=base*sk*2.*pulse;rx=(4.+(sr*1.6-4.)*f)*(1.+wb);ry=rx*(1.+(.55/1.6-1.)*f);a=.05+.15*f+wb*.6;}}
    float ang=atan(c.y-m.y,c.x-m.x)+1.04719+ph*.2;vec2 dd=uv-c;float ca=cos(-ang),sa=sin(-ang);vec2 rp=vec2(dd.x*ca-dd.y*sa,dd.x*sa+dd.y*ca);
    float e=(rp.x*rp.x)/(rx*rx)+(rp.y*rp.y)/(ry*ry);if(e<=1.)col=mix(col,hsl(hue,.8,.55),clamp(a,.05,1.));
  }}
  gl_FragColor=vec4(col,1.);
}`;

  function createProgram(gl, fragment) {
    function shader(type, source) {
      const s = gl.createShader(type);
      gl.shaderSource(s, source);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    }
    const vs = shader(gl.VERTEX_SHADER, vertex);
    const fs = shader(gl.FRAGMENT_SHADER, fragment);
    if (!vs || !fs) return null;
    const p = gl.createProgram();
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(p));
      return null;
    }
    return p;
  }

  function initCanvas(canvas) {
    if (canvas.dataset.proverShaderReady === "1") return;
    const kind = canvas.dataset.proverShader;
    const fragment = kind === "hero-cubes" ? heroFragment : kind === "antigravity" ? antigravityFragment : null;
    if (!fragment) return;
    const gl = canvas.getContext("webgl", { alpha: false, antialias: true, depth: false }) || canvas.getContext("experimental-webgl");
    if (!gl) return;
    const program = createProgram(gl, fragment);
    if (!program) return;
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(program, "p");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
    const locR = gl.getUniformLocation(program, "r");
    const locT = gl.getUniformLocation(program, "t");
    const locM = gl.getUniformLocation(program, "m");
    const locW = gl.getUniformLocation(program, "w");
    const mouse = { x: 0, y: 0, live: false };
    let wave = -9999;
    let raf = 0;
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      const height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
        if (!mouse.live) {
          mouse.x = width / 2;
          mouse.y = height / 2;
        }
      }
    }
    function move(e) {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      mouse.x = (e.clientX - rect.left) * dpr;
      mouse.y = (rect.height - (e.clientY - rect.top)) * dpr;
      mouse.live = true;
    }
    function render(ms) {
      resize();
      const time = ms / 1000;
      gl.useProgram(program);
      gl.uniform2f(locR, canvas.width, canvas.height);
      gl.uniform1f(locT, time);
      if (locM) gl.uniform2f(locM, mouse.x, mouse.y);
      if (locW) {
        if (wave < 0 || time > wave + 6) wave = time;
        gl.uniform1f(locW, wave);
      }
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      raf = requestAnimationFrame(render);
    }
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("resize", resize);
    canvas.dataset.proverShaderReady = "1";
    canvas.__proverShaderCleanup = function () {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("resize", resize);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      delete canvas.dataset.proverShaderReady;
    };
    resize();
    raf = requestAnimationFrame(render);
  }

  function scan() {
    document.querySelectorAll("canvas[data-prover-shader]").forEach(initCanvas);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scan);
  } else {
    scan();
  }
  new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
})();
