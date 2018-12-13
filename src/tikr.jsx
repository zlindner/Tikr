import React, { Component } from "react";
import styled from "styled-components";
import { Switch, Route } from "react-router-dom";
import Header from "./components/header";
import Home from "./components/home";

const App = styled.div`
    font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Open Sans, Helvetica Neue, sans-serif;
`;

const Content = styled.div`
    margin: 0 150px;
    margin-top: 70px;
`;

class Tikr extends Component {
    render() {
        return (
            <App>
                <Header />

                <Switch>
                    <Content>
                        <Route exact path="/" component={Home} />
                    </Content>
                </Switch>
            </App>
        );
    }
}

export default Tikr;
