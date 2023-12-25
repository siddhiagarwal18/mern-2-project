import React,{useEffect,useState} from 'react';
import './App.css';
import Sidebar from './Sidebar.js';
import Chat from './Chat.js';
import Pusher from 'pusher-js';
import  axios  from './axios.js';



function App() {
  const [messages,setMessages]=useState([]);


  useEffect(()=>{
    axios.get('/messages/sync').then(response=>{
     
      setMessages(response.data);
    });

  },[]);




  useEffect(()=>{
    const pusher = new Pusher('dc764bb960dbcf958e41', {
      cluster: 'ap2'
    });

    const channel = pusher.subscribe('messages');
    channel.bind('inserted',(newMessage)=> {
      
      setMessages([...messages,newMessage])
      
    });

    return()=>{
      channel.unbind_all();
      channel.unsubscribe();
    };
  },[messages]);

  console.log(messages);
  return (
    <div className="App">
      {/* <h1> lets build a mern whatsapp clone</h1> */}
      <div className='app__body'>

      
      <Sidebar/>
      <Chat messages ={messages}/>
      </div>
    </div>
  );
}

export default App;
