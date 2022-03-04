(function () {
    const d3 = window.d3
    // have a reference to the containing element
    const dom = d3.select('.js-vis-wrap')
    // create some dummy data
    /* const data = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100 ...] */
    const data = d3.range(18).map(n => n * 10)
    // have a max number of items to display
    const maxDisplay = 10
    // track if the pagination is clicked
    let paginationState = true
    // labels for pagination button
    const paginationText = ['next  →', '← prev']
  
    // loop through the data to append charts
    data.forEach(function (d, i) {
      console.log(d)
      // put max number of items in this div
      if (i < maxDisplay) {
        createChart(d, i, '.js-vis-1')
      } else {
      // overflow any others here
        createChart(d, i, '.js-vis-2')
      }
    })
  
    // add pagination if over max number of items
    if (data.length > maxDisplay) {
      createPagination(dom)
    } else {
      removePagination(dom)
    }
  
    // create a simple 'chart' to illustrate example
    function createChart (datum, index, selection) {
      // this could be an svg etc
      dom.select(selection).append('div')
        .attr('class', 'col col-2 p2 m1 chart i-' + index)
        .append('h1')
        .attr('class', 'center')
        .text(datum)
    }
    // add pagination
    function createPagination (sel) {
      sel.append('button')
        .attr('class', 'pagination inline-block btn btn-primary m1')
        .on('click', () => {
          // main div holding 9 items
          sel.select('.js-vis-1')
            .classed('display-none', paginationState)
          // div holding remaining items
          sel.select('.js-vis-2')
            .classed('display-none', !paginationState)
          // update pagination state
          if (paginationState) {
            paginationState = false
            // update the btn label 'prev'
            sel.select('.pagination')
              .text(paginationText[1])
          } else {
            paginationState = true
            // update the btn label 'next'
            sel.select('.pagination')
              .text(paginationText[0])
          }
        })
        .text(paginationText[0])
    }
    // have a method to clear pagination when not needed
    function removePagination (sel) {
      sel.select('.pagination').remove()
    }
  }())