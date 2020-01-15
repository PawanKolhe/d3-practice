const svg = d3.select('.canvas')
  .append('svg')
    .attr('width', 600)
    .attr('height', 600);

// create margins and dimensions
const margin = {top: 20, right: 20, bottom: 100, left: 100};
const graphWidth = 600 - margin.left - margin.right;
const graphHeight = 600 - margin.top - margin.bottom;

const graph = svg.append('g')
  .attr('width', graphWidth)
  .attr('height', graphHeight)
  .attr('transform', `translate(${margin.left}, ${margin.top})`);

const xAxisGroup = graph.append('g')
  .attr('transform', `translate(0, ${graphHeight})`);
const yAxisGroup = graph.append('g');

// create Linear Scale
const y = d3.scaleLinear()
  .range([graphHeight, 0]);

// create Band Scale
const x = d3.scaleBand()
  .range([0, graphWidth])
  .paddingInner(0.2)
  .paddingOuter(0.2);

// create axes
const xAxis = d3.axisBottom(x);
const yAxis = d3.axisLeft(y)
  .ticks(3)
  .tickFormat(d => d + ' orders');

// updates x-axis text
xAxisGroup.selectAll('text')
  .attr('transform', 'rotate(-40)')
  .attr('text-anchor', 'end')
  .attr('fill', 'orange');

const t = d3.transition().duration(500);

// UPDATE FUNCTION
const update = (data) => {
  // 1. update scales (domains) if they rely on our data
  y.domain([0, d3.max(data, item => item.orders)]);
  x.domain(data.map(item => item.name));

  // 2. join data to elements
  const rects = graph.selectAll('rect')
    .data(data);

  // 3. remove unwanted (if any) shapes using exit selection
  rects.exit().remove();

  // 4. add attributes to rects already in the DOM
  rects
    .attr('width', x.bandwidth)
    .attr('fill', 'orange')
    .attr('x', d => x(d.name))
    // following is being merged in enter selection
    // .transition(t)
    //   .attr('y', d => y(d.orders))
    //   .attr('height', d => graphHeight - y(d.orders));

  // 5. append the enter selection to DOM
  rects.enter()
    .append('rect')
      // .attr('width', 0) <-- already set by widthTween
      .attr('height', 0)
      .attr('fill', 'orange')
      .attr('x', d => x(d.name))
      .attr('y', graphHeight)
      .merge(rects)
      .transition(t)
        .attrTween('width', widthTween)
        .attr('y', d => y(d.orders))
        .attr('height', d => graphHeight - y(d.orders));

  // call axes
  xAxisGroup.call(xAxis);
  yAxisGroup.call(yAxis);
}


// FETCH DATA
let data = [];
db.collection('dishes').onSnapshot(res => {

  res.docChanges().forEach(change => {
    const doc = {...change.doc.data(), id: change.doc.id};

    switch(change.type) {
      case 'added':
        data.push(doc);
        break;
      case 'modified':
        const index = data.findIndex(item => item.id == doc.id);
        data[index] = doc;
        break;
      case 'removed':
        data = data.filter(item => item.id != doc.id);
        break;
      default:
        break;
    }

    update(data);
  });
});


// TWEENS
const widthTween = (d) => {
  // define interpolation
  // d3.interpolation returns a function which we call 'i'
  let  i = d3.interpolate(0, x.bandwidth());

  //return a function which takes in a time ticker 't'
  return function(t) {

    // return the value from passing the ticker into interpolation
    return i(t);
  }
}