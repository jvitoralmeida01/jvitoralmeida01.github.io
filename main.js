const fetchText = async (url) => {
  const response = await fetch(url);
  return await response.text();
};

let corPartidoMap = new Map();
const getCorPartidor = (partido) => {
  if (corPartidoMap.has(partido)) {
    return corPartidoMap.get(partido);
  } else {
    let randomColor = [];
    randomColor.push(Math.floor(Math.random() * 120) + 100);
    randomColor.push(Math.floor(Math.random() * 120) + 100);
    randomColor.push(Math.floor(Math.random() * 120) + 100);
    corPartidoMap.set(
      partido,
      "rgb(" +
        randomColor[0] +
        ", " +
        randomColor[1] +
        ", " +
        randomColor[2] +
        ")"
    );
    return corPartidoMap.get(partido);
  }
};

const width = 850;
const height = 650;
const rings = [
  {limit: 10, radius: 150},
  {limit: 23, radius: 200},
  {limit: 42, radius: 250},
  {limit: 60, radius: 300},
  {limit: 81, radius: 350},
]
function ringByIndex(index){
  if(index < 10) return 0
  if(index < 23) return 1
  if(index < 42) return 2
  if(index < 60) return 3
  if(index < 81) return 4
}
function getSteps(currRing){
  if(currRing == 0){
    return step = 180 / rings[currRing].limit + 2
  }else{
    return step = 180 / (rings[currRing].limit - rings[currRing-1].limit - 1)
  }
}
function getAngle(currRing, index, step){
  if(currRing == 0){
    return angle = 90 + index*step
  }else{
    return angle = 90 + (index-rings[currRing-1].limit)*step
  }
}
const getCircleX = (index) => {
  let currRing = ringByIndex(index)
  const step = getSteps(currRing)
  const angle = getAngle(currRing, index, step)
  return Math.sin(angle * Math.PI/180) * rings[currRing].radius + (width/2)
}
const getCircleY = (index) => {
  let currRing = ringByIndex(index)
  const step = getSteps(currRing)
  const angle = getAngle(currRing, index, step)
  return Math.cos(angle * Math.PI/180) * rings[currRing].radius + (height) - 20
}

const csvUrl = "./Senadores.csv";
// //"https://raw.githubusercontent.com/nivan/testPython/main/ListaParlamentarEmExercicio.csv";

let data;

fetchText(csvUrl)
  .then((text) => {
    //tratar dados
    data = d3.csvParse(text);
    // Sortar por partido
    data.sort((a, b) => {
      if(a.SiglaPartidoParlamentar > b.SiglaPartidoParlamentar){
        return -1
      }
      if(b.SiglaPartidoParlamentar > a.SiglaPartidoParlamentar){
        return 1
      }
      return 0
    })
    return data;
  })
  .then((data) => {

    let positions = [];
    data.forEach((d, i) => {
      d.id = i; // criar id após sortar por partido
      positions.push({
        x: getCircleX(i),
        y: getCircleY(i),
      });
    })

    let image = d3.select("img");
    let labelNome = d3.select("h1");
    let labelPartido = d3.select("h2");

    let svg = d3.select("div").select("svg");
    let circles = svg.selectAll("circle");
    circles
      .data(data)
      .join(
        enter => enter
        .append('circle')
        .attr('fill', d=>getCorPartidor(d.SiglaPartidoParlamentar))
        .attr('r', 15)
        .style('opacity', 0.3)
        .attr('cx', d=>positions[d.id].x)
        .attr('cy', d=>positions[d.id].y)
        .attr("id", d=>"senador_"+d.id)
        .text((d) => d.NomeParlamentar + " " + d.SiglaPartidoParlamentar)
        .on("click", (event, d) => {

          gsap.fromTo("img", 
          {transform: "translateY(290px) scale(0.5)", opacity: 0}, 
          {
            ease: Power3.easeOut,
            duration: 0.8, 
            transform: "translateY(290px) scale(1)", 
            opacity: 1,
          }
          );
          gsap.fromTo("h1", 
          {transform: "translateY(450px)", opacity: 0}, 
          {
            ease: Back.easeOut.config(1.7),
            duration: 0.9, 
            transform: "translateY(400px)", 
            opacity: 1}
          );
          gsap.fromTo("h2", 
          {transform: "translateY(500px)", opacity: 0}, 
          {
            ease: Back.easeOut.config(1.7),
            duration: 0.9,
            delay: 0.3, 
            transform: "translateY(450px)",
            opacity: 1
          }
          );

          image.attr("src", () => {
            return d.UrlFotoParlamentar;
          })
          .on('click', () => {
            window.open(d.UrlFotoParlamentar)
          })

          labelNome.text(d.NomeParlamentar);

          labelPartido
            .style("color", getCorPartidor(d.SiglaPartidoParlamentar))
            .text(d.SiglaPartidoParlamentar);
        })
        .on("mouseover", (event, d) => {
          d3.select(event.target)
          .transition()
          .duration(200)
          .attr("r", 20)
          .style('opacity', 1)
          .style('stroke', 'white')
          .style('stroke-width', '2px');
        })
        .on("mouseleave", (event, d) => {
          d3.select(event.target)
          .transition()
          .duration(200)
          .attr("r", 15)
          .style('opacity', 0.3)
          .style('stroke-width', '0px');
        })
      )
  });

//svgTitle.innerHTML = nome;