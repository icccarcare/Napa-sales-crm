import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = {error:null,info:null}; }
  static getDerivedStateFromError(e) { return {error:e}; }
  componentDidCatch(e,info) { this.setState({info}); }
  render() {
    if(this.state.error) return (
      <div style={{padding:40,fontFamily:"monospace",fontSize:13,color:"red",background:"#fff",minHeight:"100vh"}}>
        <h2 style={{color:"#cc0000"}}>App Error — send this screenshot to Claude</h2>
        <p><strong>Message:</strong> {this.state.error.message}</p>
        <pre style={{whiteSpace:"pre-wrap",wordBreak:"break-all"}}>{this.state.error.stack}</pre>
        {this.state.info&&<pre style={{whiteSpace:"pre-wrap"}}>{this.state.info.componentStack}</pre>}
      </div>
    );
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary><App /></ErrorBoundary>
)
