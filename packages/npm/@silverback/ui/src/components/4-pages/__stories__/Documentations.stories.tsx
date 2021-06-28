import { Meta, Story } from '@storybook/react/types-6-0';
import React from 'react';

import Documentation from '../Documentation';

export default {
  title: 'Pages/Documentation',
  component: Documentation,
} as Meta;

export const WithTOC: Story = () => (
  <Documentation
    title={'This is the title'}
    toc={[
      {
        title: 'Headline A',
        url: '#a',
      },
      {
        title: 'Headline B',
        url: '#b',
      },
      {
        title: 'Headline C',
        url: '#c',
      },
    ]}
  >
    <h1>Test Content</h1>
    <p>
      {`That's great, but we need to add this 2000 line essay make it sexy, for
      can we try some other colours maybe try a more powerful colour, nor can
      you make it stand out more?, i know you've made thirty iterations but can
      we go back to the first one that was the best version. Start on it today
      and we will talk about what i want next time can you please send me the
      design specs again? i think this should be fairly easy so if you just want
      to have a look but can you pimp this powerpoint, need more geometry
      patterns could you solutionize that for me. Try a more powerful colour can
      you make it stand out more? for we are a non-profit organization, for we
      are a startup, or remember, everything is the same or better i know you've
      made thirty iterations but can we go back to the first one that was the
      best version or can you help me out? you will get a lot of free exposure
      doing this. Can it be more retro. Im not sure, try something else. I was
      wondering if my cat could be placed over the logo in the flyer thats not
      what i saw in my head at all but make it pop, for labrador but we don't
      need a backup, it never goes down!. This was not according to brief this
      red is too red this turned out different that i decscribed yet jazz it up
      a little could you solutionize that for me make it look like Apple, but i
      think this should be fairly easy so if you just want to have a look. Make
      it sexy can we try some other colours maybe, or the flier should feel like
      a warm handshake, jazz it up a little. That's going to be a chunk of
      change. This was not according to brief I really like the colour but can
      you change it. Can you make it pop that's great, but can you make it work
      for ie 2 please, i'll know it when i see it nor can you please send me the
      design specs again?. Is there a way we can make the page feel more
      introductory without being cheesy are you busy this weekend? I have a new
      project with a tight deadline can we have another option, and can we try
      some other colours maybe, or needs to be sleeker, for this red is too red.
      It needs to be the same, but totally different can you please change the
      color theme of the website to pink and purple? make the logo a bit smaller
      because the logo is too big can you link the icons to my social media
      accounts? oh and please put pictures of cats everywhere I like it, but can
      the snow look a little warmer. Can you make the logo bigger yes bigger
      bigger still the logo is too big try a more powerful colour. We exceed the
      clients' expectations make the font bigger can you make the blue bluer?
      nor I think we need to start from scratch, and is there a way we can make
      the page feel more introductory without being cheesy can you please change
      the color theme of the website to pink and purple? make the logo a bit
      smaller because the logo is too big can you link the icons to my social
      media accounts? oh and please put pictures of cats everywhere. Thats not
      what i saw in my head at all will royalties in the company do instead of
      cash, that's great, but can you make it work for ie 2 please but can you
      make the blue bluer? for try making it a bit less blah can you help me
      out? you will get a lot of free exposure doing this. Can we try some other
      colours maybe labrador.`}
    </p>
  </Documentation>
);
