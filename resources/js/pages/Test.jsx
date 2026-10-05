import Layout from "../Layouts/Layout";

function Test({ name, client }) {
  console.log('Props received:', name);
  return (
    <>
<h1>Hello</h1>
    </>
  )
}

// Test.layout = page => <Layout children={page} title="Dashboard" />


export default Test;