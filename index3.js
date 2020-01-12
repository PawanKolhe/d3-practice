const svg = d3.selectAll('svg');

d3.json('planets.json').then((data) => {
  const circs = svg.selectAll('circle')
    .data(data);

  // add attrs to circs already in the DOM
  circs
    .attr('cx', d => d.distance)
    .attr('cy', 200)
    .attr('r', d => d.radius)
    .attr('fill', d => d.fill);

  // append the enter selection to DOM
  circs.enter()
    .append('circle')
      .attr('cx', d => d.distance)
      .attr('cy', 200)
      .attr('r', d => d.radius)
      .attr('fill', d => d.fill);
});