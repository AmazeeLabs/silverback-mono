We cannot run Gatsby Preview and Gatsby Site tests in parallel because
`gatsby develop` and `gatsby build` use the same `.cache` directory, and they
collide. So we run tests separately. See [test.sh](../../test.sh).
