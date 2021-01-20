$.ajax({
  url: 'http://localhost:3000/api/list',
  method: 'post',
  data: JSON.stringify({
    a: 'a',
    b: 'b'
  })
})
  .then(res => {})
  .catch(err => {
    // debugger
  })
