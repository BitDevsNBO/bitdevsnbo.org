# BitDevsNBO

Simple Zola site for hosting all of the links from meetups past and future.

## Development

You'll need [Zola](https://www.getzola.org/documentation/getting-started/installation/) to run the
site locally. Once it is setup:

* Clone the repository and go into the directory
* Run `zola serve`
* Go to http://localhost:1111

## Making a Post

To make a new post, make a new file in the `content` directory with a title of
`YYYY-MM-DD-title-goes-here.md`. At the top of the file you must provide the
following information:

```md
+++
title = "<title goes here>"
template = "post.html"
[extra]
meetup_id = "<optional meetup id goes here>"
+++
```

After that, it's just simple [markdown](https://www.markdownguide.org/cheat-sheet/). 
The site will auto-generate the rest.

## Changing Site Data

All site configurations are contained in `config.toml`.

## Attributions

Thanks to [BitDevs NYC](https://github.com/BitDevsNYC/BitDevsNYC.github.io) for the
Jekyll site that this site is based on, and to [BitDevs LA](https://bitdevsla.org) for creating 
this [Zola](https://www.getzola.org) BitDevs template.