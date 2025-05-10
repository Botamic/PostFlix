const cons = console

const postCreationOptions = {
  titleCap: 15,
  descriptionCap: 500
}

const { createClient } = supabase;

const supabaseClient = createClient(
  'https://gmvmmypxclgmfcssyhsd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdtdm1teXB4Y2xnbWZjc3N5aHNkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDY0MDg1MywiZXhwIjoyMDYwMjE2ODUzfQ.fJEG0VPaJNNpTr3kRE3gOFfcAhy55r67JouIdgs1AeQ'
);
const channel = supabaseClient.channel('test')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'posts',
  }, (payload) => {
    console.log('Something changed in "posts"!');
    console.log(payload);
    console.log('-------------------------------\n')
    fetchPosts()
  })
  .subscribe((status) => { // status can be named anything, it's a argument passed in the parameters, so it can be named anything but will always represent the status. -Justin
    console.log('Channel status:', status);
  });

const AddNewPost = (id, title, desc, timeSt) => {
  const target = document.querySelector('.postsDiv')
  const postHTML = `
  <div class="post">
    <p class="idParag">id: <strong>${id}</strong></p>
    <h2>${title}</h2>
    <p class="descParag">${desc}</p>
    <p class="timeParag">${timeSt}</p>
  </div>`

  target.insertAdjacentHTML('beforeend', postHTML)
}

const clearAdjecentPosts = () => {
  let targetPosts = document.querySelectorAll('.post')
  targetPosts.forEach((targetPost) => {
    targetPost.remove()
  })
}

const fetchPosts = async () => {
  let { data, error } = await supabaseClient.from('posts').select('*').order('id', { ascending: false }).limit(10);
  if (error) {
    cons.log('Oops... An error accured ', error)
  } else {
    cons.log('Successfully fetched requested posts: ', data)
  }
  clearAdjecentPosts()
  data.forEach((dataSel) => {
    AddNewPost(dataSel.id, dataSel.post_title, dataSel.post_paragraph, dataSel.created_at)
  })
}

const postButton = document.querySelector('.postButton')
const descriptionInput = document.querySelector('#descriptionInput')
const titleInput = document.querySelector('.titleInput')

postButton.addEventListener('click', async () => {
  if (descriptionInput.value === '' && titleInput.value === '') { // if boxes are empty
    alert('Boxes may not be empty');
    return
  } else if (descriptionInput.value.length >= postCreationOptions.descriptionCap || titleInput.value.length >= postCreationOptions.titleCap) {
    alert(`Letter limit reached:
      Title cap: ${postCreationOptions.titleCap}
      Description cap: ${postCreationOptions.descriptionCap}`)
    return
  }
  const { data, error } = await supabaseClient.from('posts').insert([{ post_title: titleInput.value, post_paragraph: descriptionInput.value }])
  if (error) {
    console.log('Something went wrong... ', error)
  } else {
    console.log('Insert was sucessful, no errors: ', data)
    descriptionInput.value = ''
    titleInput.value = ''
  }
  fetchPosts()
})

window.onload = () => {
  fetchPosts()
}