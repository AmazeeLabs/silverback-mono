import React from "react";
import * as headings from "gatsby-theme-docz/src/components/Headings";
import { Code } from "gatsby-theme-docz/src/components/Code";
import { Layout } from "gatsby-theme-docz/src/components/Layout";
import { Playground } from "gatsby-theme-docz/src/components/Playground";
import { Pre } from "gatsby-theme-docz/src/components/Pre";
import { Props } from "gatsby-theme-docz/src/components/Props";

const a = (props) =>
  props.href.startsWith("http://") || props.href.startsWith("https://") ? (
    <a {...props} target="_blank" rel="noreferrer nofollow">
      {props.children}
    </a>
  ) : (
    <a {...props}>{props.children}</a>
  );

const Config = (props) => <Code>{props.name}</Code>
const NPMPackage = (props) => <Code>{`npm install ` + props.name}</Code>
const GatsbyPlugin = (props) => <Code>{props.name}</Code>
const GatsbyShadowFile = (props) => <Code>{props.path}</Code>
const File = (props) => <Code>{props.path}</Code>

export default {
  ...headings,
  code: Code,
  a,
  playground: Playground,
  pre: Pre,
  layout: Layout,
  props: Props,
  Config,
  NPMPackage,
  GatsbyPlugin,
  GatsbyShadowFile,
  File,
};
