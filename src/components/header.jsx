import React, { Component } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

const Wrapper = styled.div`
    width: 100vw;
    height: 70px;
    padding: 0 30px;
    top: 0;
    position: fixed;
    background-color: #ffffff;
    box-sizing: border-box;

    & .name {
        font-size: 32px;
    }

    & ul {
        float: right;
        padding: 0;
        margin: 0;
        list-style: disc inside none;
    }

    & li {
        display: block;
        float: left;
        position: relative;
    }

    & a {
        color: #292929;
        text-decoration: none;
        outline: 0;
        padding: 0 15px;
        line-height: 60px;
        font-weight: 500;
    }

    & a:visited {
        color: #292929;
    }

    & a:hover {
        color: #19be87;
    }
`;

class Header extends Component {
    state = {};
    render() {
        return (
            <Wrapper>
                <Link to="/" className="name">
                    tikr.
                </Link>

                <ul>
                    <li>
                        <Link to="/">home</Link>
                    </li>
                    <li>
                        <Link to="/login">login</Link>
                    </li>
                </ul>
            </Wrapper>
        );
    }
}

export default Header;
