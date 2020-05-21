import React from 'react';
import { Container, Col, Row, Button } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Chat from './Chat';

function App() {
  return (
    <Container>
      <Row>
        <Col className="text-center">
          <h2>WebShop - Exam project</h2>
          <Chat/>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
