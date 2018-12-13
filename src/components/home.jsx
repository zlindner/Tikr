import React, { Component } from "react";
import styled, { keyframes } from "styled-components";

const Grow = keyframes`
    from {
        left: 0;
    }

    to {
        left: 100%;
    }
`;

const Wrapper = styled.div`
    display: flex;
    align-items: center;
    padding: 100px 0;
    box-sizing: border-box;

    & button {
        display: block;
        width: 230px;
        margin: 35px 0;
        padding: 14px 20px;
        border-radius: 5px;
        background-color: #19be87;
        color: #ffffff;
        font-size: 12px;
        font-weight: 500;
        outline: 0;
        border: 1px solid transparent;
        box-shadow: rgba(0, 0, 0, 0.13) 0px 3px 5px 0px;
        transition: all 250ms ease-in-out;
    }

    & button:hover {
        transform: translateY(-3px);
        cursor: pointer;
    }

    & .reveal {
        overflow: hidden;
        position: relative;
        display: flex;
    }

    & .reveal:after {
        content: " ";
        position: absolute;
        display: block;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #ffffff;
        z-index: 2;
        animation: ${Grow} 3s forwards;
    }

    & img {
        margin: 0 auto;
    }
`;

const FadeIn = keyframes`
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
`;

const Column = styled.div`
    width: 50%;
    padding: 0 15px;
    padding-top: 35px;
    box-sizing: border-box;

    &#left {
        animation: ${FadeIn} 1s;
    }
`;

const Tagline = styled.span`
    display: block;
    font-size: 60px;
    font-weight: 700;
    letter-spacing: 2px;
`;

const Description = styled.span`
    font-size: 15px;
    line-height: 28px;
    color: #4b555f;
`;

class Home extends Component {
    state = {};
    render() {
        return (
            <Wrapper>
                <Column id="left">
                    <Tagline>Learn to invest in the stock market.</Tagline>

                    <button>GET STARTED</button>

                    <Description>Practice individually or with friends using real-time stock market data.</Description>
                </Column>

                <Column id="right">
                    <div className="reveal">
                        <img src={require("../assets/stock.png")} alt="stock chart" />
                    </div>
                </Column>
            </Wrapper>
        );
    }
}

export default Home;
