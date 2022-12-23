import { Component } from 'react'

export default class ErrorBoundary extends Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false };
    }
  
    componentDidCatch(error, info) {
      // Display fallback UI
      this.setState({ hasError: true });
      // You can also log the error to an error reporting service
    //   logErrorToMyService(error, info);
    }
  
    render() {
      if (this.state.hasError) {
        return <>
          <h1 className="title is-size-1 has-text-primary has-text-centered">Something went wrong.</h1>
          <h2 className="subtitle is-size-3 has-text-centered">Please try again in a bit.</h2>
        </>;
      }
      return this.props.children;
    }
  }