import { getSchema } from '@tiptap/core'
import { TaskItem } from '@tiptap/extension-task-item'
import { TaskList } from '@tiptap/extension-task-list'

import { PlainTextKit } from '../../extensions/plain-text/plain-text-kit'
import { RichTextKit } from '../../extensions/rich-text/rich-text-kit'
import { createSuggestionExtension } from '../../factories/create-suggestion-extension'

import { createMarkdownSerializer } from './markdown'

import type { MarkdownSerializerReturnType } from './markdown'

const HTML_INPUT_HEADINGS = `<h1>Heading level 1</h1>
<h2>Heading level 2</h2>
<h3>Heading level 3</h3>
<h4>Heading level 4</h4>
<h5>Heading level 5</h5>
<h6>Heading level 6</h6>`

const HTML_INPUT_PARAGRAPHS = `<p>I really like using Markdown.</p>
<p>I think I&#39;ll use it to format all of my documents from now on.</p>`

const HTML_INPUT_LINE_BREAKS = `<p>This is the first line.<br>And this is the second line.</p>`

const HTML_INPUT_STYLED_TEXT = `<p>I just love <strong>bold text</strong>.<br>I just love <strong>bold text</strong>.</p>
<p>Italicized text is the <em>cat&#39;s meow</em>.<br>Italicized text is the <em>cat&#39;s meow</em>.</p>
<p>This text is <em><strong>really important</strong></em>.<br>This text is <em><strong>really important</strong></em>.<br>This text is <strong><em>really important</em></strong>.<br>This text is <strong><em>really important</em></strong>.<br>This is really <em><strong>very</strong></em> important text.</p>
<p>Strikethrough uses two tildes: <del>scratch this</del></p>`

const HTML_INPUT_BLOCKQUOTES = `<blockquote>
<p>Dorothy followed her through many of the beautiful rooms in her castle.</p>
</blockquote>
<blockquote>
<p>Dorothy followed her through many of the beautiful rooms in her castle.</p>
<p>The Witch bade her clean the pots and kettles and sweep the floor and keep the fire fed with wood.</p>
</blockquote>
<blockquote>
<p>Dorothy followed her through many of the beautiful rooms in her castle.</p>
<blockquote>
<p>The Witch bade her clean the pots and kettles and sweep the floor and keep the fire fed with wood.</p>
</blockquote>
</blockquote>
<blockquote>
<h4>The quarterly results look great!</h4>
<ul>
<li>Revenue was off the chart.</li>
<li>Profits were higher than ever.</li>
</ul>
<p><em>Everything</em> is going according to <strong>plan</strong>.</p>
</blockquote>`

const HTML_INPUT_ORDERED_LISTS = `<ol>
<li>First item</li>
<li>Second item</li>
<li>Third item</li>
<li>Fourth item</li>
</ol>
<hr>
<ol start="5">
<li>First item</li>
<li>Second item</li>
<li>Third item</li>
<li>Fourth item</li>
</ol>
<hr>
<ol>
<li>First item</li>
<li>Second item</li>
<li>Third item<ol>
<li>Indented item</li>
<li>Indented item</li>
</ol>
</li>
<li>Fourth item</li>
</ol>`

const HTML_INPUT_UNORDERED_LISTS = `<ul>
<li>First item</li>
<li>Second item</li>
<li>Third item</li>
<li>Fourth item</li>
</ul>
<hr>
<ul>
<li>First item</li>
<li>Second item</li>
<li>Third item<ul>
<li>Indented item</li>
<li>Indented item</li>
</ul>
</li>
<li>Fourth item</li>
</ul>
<hr>
<ul>
<li>1968. A great year!</li>
<li>I think 1969 was second best.</li>
</ul>
<hr>
<ul>
<li>This is the first list item.</li>
<li>Here&#39;s the second list item.<br>  I need to add another paragraph below the second list item.</li>
<li>And here&#39;s the third list item.</li>
</ul>`

const HTML_INPUT_TASK_LISTS = `<ul data-type="taskList">
<li data-type="taskItem" data-checked="false">First item</li>
<li data-type="taskItem" data-checked="true">Second item</li>
<li data-type="taskItem" data-checked="true">Third item</li>
<li data-type="taskItem" data-checked="false">Fourth item</li>
</ul>
<hr>
<ul data-type="taskList">
<li data-type="taskItem" data-checked="true">First item</li>
<li data-type="taskItem" data-checked="false">Second item</li>
<li data-type="taskItem" data-checked="false">Third item</li>
<li data-type="taskItem" data-checked="true">Fourth item</li>
</ul>
<hr>
<ul data-type="taskList">
<li data-type="taskItem" data-checked="true">First item</li>
<li data-type="taskItem" data-checked="false">Second item</li>
<li data-type="taskItem" data-checked="true">Third item</li>
<li data-type="taskItem" data-checked="false">Fourth item</li>
</ul>
<hr>
<ul data-type="taskList">
<li>First item</li>
<li>Second item</li>
<li>Third item<ul data-type="taskList">
<li data-type="taskItem" data-checked="false">Indented item</li>
<li data-type="taskItem" data-checked="false">Indented item</li>
</ul>
</li>
<li>Fourth item</li>
</ul>
<hr>
<ul data-type="taskList">
<li data-type="taskItem" data-checked="false">1968. A great year!</li>
<li data-type="taskItem" data-checked="true">I think 1969 was second best.</li>
</ul>
<hr>
<ul data-type="taskList">
<li data-type="taskItem" data-checked="false">This is the first list item.</li>
<li data-type="taskItem" data-checked="false">Here&#39;s the second list item.<br>  I need to add another paragraph below the second list item.</li>
<li data-type="taskItem" data-checked="false">And here&#39;s the third list item.</li>
</ul>`

const HTML_INPUT_IMAGES = `<img src="/assets/images/tux.png" alt="Tux, the Linux mascot">
<img src="/assets/images/tux.png" alt="Tux, the Linux mascot" title="The Linux mascot">
<img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=">
<p><a href="https://d33wubrfki0l68.cloudfront.net/e7ed9fe4bafe46e275c807d63591f85f9ab246ba/e2d28/assets/images/tux.png"><img src="/assets/images/tux.png" alt="Tux, the Linux mascot" title="The Linux mascot"></a></p>`

const HTML_INPUT_CODE = `<p>At the command prompt, type <code>nano</code>.</p>
<p><code>Use \`code\` in your Markdown file.</code></p>`

const HTML_INPUT_CODE_BLOCK = `<pre><code>&lt;html&gt;
  &lt;head&gt;
    &lt;title&gt;Test&lt;/title&gt;
  &lt;/head&gt;
&lt;/html&gt;</code></pre>`

const HTML_INPUT_INDENTED_BLOCK_ELEMENTS = `<ol>
<li>Blockquote:<blockquote>
<p>Dorothy followed her through many of the beautiful rooms in her castle.</p>
</blockquote>
</li>
<li>Image:<br> <img src="/assets/images/tux.png" alt="Tux, the Linux mascot"></li>
<li>Codeblock:<pre><code>&lt;html&gt;
  &lt;head&gt;
    &lt;title&gt;Test&lt;/title&gt;
  &lt;/head&gt;
&lt;/html&gt;</code></pre>
</li>
</ol>`

const HTML_INPUT_LINE_RULES = `<hr>
<hr>
<hr>`

const HTML_INPUT_LINKS = `<p>My favorite search engine is <a href="https://duckduckgo.com">Duck Duck Go</a>.<br>My favorite search engine is <a href="https://duckduckgo.com" title="The best search engine for privacy">Duck Duck Go</a>.</p>`

const HTML_INPUT_STYLED_LINKS = `<p>I love supporting the <strong><a href="https://eff.org">EFF</a></strong>.<br>This is the <em><a href="https://www.markdownguide.org">Markdown Guide</a></em>.<br>See the section on <a href="#code"><code>code</code></a>.</p>`

describe('Markdown Serializer', () => {
    const HTML_INPUT_SPECIAL_HTML_CHARS = `Ambition &amp; Balance<br>
&lt;doist&gt;<br>
&lt;/doist&gt;<br>
&lt;doist&gt;&lt;/doist&gt;<br>
&quot;Doist&quot;<br>
&#39;Doist&#39;`

    const HTML_INPUT_SPECIAL_MARKDOWN_CHARS = `before \\ after<br>
before * after<br>
- after<br>
+ after<br>
= after<br>
=== after<br>
\` after <br>
~~~ after<br>
before [ after<br>
before ] after<br>
> after<br>
before _ after<br>
1. after<br>
99. after<br>`

    describe('Plain-text Document', () => {
        let markdownSerializer: MarkdownSerializerReturnType

        beforeEach(() => {
            markdownSerializer = createMarkdownSerializer(getSchema([PlainTextKit]))
        })

        test('special HTML entities are converted to ASCII characters', () => {
            expect(markdownSerializer.serialize(HTML_INPUT_SPECIAL_HTML_CHARS))
                .toBe(`Ambition & Balance
<doist>
</doist>
<doist></doist>
"Doist"
'Doist'`)
        })

        test('special Markdown characters are NOT escaped', () => {
            expect(markdownSerializer.serialize(HTML_INPUT_SPECIAL_MARKDOWN_CHARS))
                .toBe(`before \\ after
before * after
- after
+ after
= after
=== after
\` after
~~~ after
before [ after
before ] after
> after
before _ after
1. after
99. after`)
        })

        test('paragraphs Markdown output is correct', () => {
            expect(markdownSerializer.serialize(HTML_INPUT_PARAGRAPHS)).toBe(
                `I really like using Markdown.
I think I'll use it to format all of my documents from now on.`,
            )
        })

        describe('without `listItem` extension', () => {
            test('ordered lists Markdown output is correct', () => {
                expect(markdownSerializer.serialize(HTML_INPUT_ORDERED_LISTS)).toBe(
                    `1.  First item
2.  Second item
3.  Third item
4.  Fourth item

---

5.  First item
6.  Second item
7.  Third item
8.  Fourth item

---

1.  First item
2.  Second item
3.  Third item
    1.  Indented item
    2.  Indented item
4.  Fourth item`,
                )
            })

            test('unordered lists Markdown output is correct', () => {
                expect(markdownSerializer.serialize(HTML_INPUT_UNORDERED_LISTS)).toBe(
                    `-   First item
-   Second item
-   Third item
-   Fourth item

---

-   First item
-   Second item
-   Third item
    -   Indented item
    -   Indented item
-   Fourth item

---

-   1968. A great year!
-   I think 1969 was second best.

---

-   This is the first list item.
-   Here's the second list item.
      I need to add another paragraph below the second list item.
-   And here's the third list item.`,
                )
            })
        })

        describe('without `strike` extension', () => {
            test('strikethrough Markdown output is correct', () => {
                const customSerializer = createMarkdownSerializer(
                    getSchema([
                        RichTextKit.configure({
                            strike: false,
                        }),
                    ]),
                )

                expect(
                    customSerializer.serialize(
                        '<p>Strikethrough uses two tildes: <del>scratch this</del></p>',
                    ),
                ).toBe('Strikethrough uses two tildes: scratch this')
            })
        })

        describe('without custom `taskList` extension', () => {
            test('task lists syntax is ignored', () => {
                expect(markdownSerializer.serialize(HTML_INPUT_TASK_LISTS)).toBe(
                    `-   First item
-   Second item
-   Third item
-   Fourth item

---

-   First item
-   Second item
-   Third item
-   Fourth item

---

-   First item
-   Second item
-   Third item
-   Fourth item

---

-   First item
-   Second item
-   Third item
    -   Indented item
    -   Indented item
-   Fourth item

---

-   1968. A great year!
-   I think 1969 was second best.

---

-   This is the first list item.
-   Here's the second list item.
      I need to add another paragraph below the second list item.
-   And here's the third list item.`,
                )
            })
        })

        describe('with custom `*Suggestion` extensions', () => {
            test('mention suggestion Markdown output is correct', () => {
                const customSerializer = createMarkdownSerializer(
                    getSchema([RichTextKit, createSuggestionExtension('mention')]),
                )

                expect(
                    customSerializer.serialize(
                        `<p>Question: Who&#39;s the head of the Frontend team?<br>Answer: <span data-mention data-id="963827" data-label="Henning M">@Henning M</span></p>`,
                    ),
                ).toBe(`Question: Who's the head of the Frontend team?
Answer: [Henning M](mention://963827)`)
            })

            test('channel suggestions Markdown output is correct', () => {
                const customSerializer = createMarkdownSerializer(
                    getSchema([RichTextKit, createSuggestionExtension('channel')]),
                )

                expect(
                    customSerializer.serialize(
                        `<p>Question: What&#39;s the best channel on Twist?<br>Answer: <span data-channel data-id="190200" data-label="Doist Frontend">#Doist Frontend</span></p>`,
                    ),
                ).toBe(`Question: What's the best channel on Twist?
Answer: [Doist Frontend](channel://190200)`)
            })
        })
    })

    describe('Rich-text Document', () => {
        let markdownSerializer: MarkdownSerializerReturnType

        beforeEach(() => {
            markdownSerializer = createMarkdownSerializer(getSchema([RichTextKit]))
        })

        test('special HTML entities are converted to ASCII characters', () => {
            expect(markdownSerializer.serialize(HTML_INPUT_SPECIAL_HTML_CHARS))
                .toBe(`Ambition & Balance
<doist>
</doist>
<doist></doist>
"Doist"
'Doist'`)
        })

        test('special Markdown characters are escaped', () => {
            expect(markdownSerializer.serialize(HTML_INPUT_SPECIAL_MARKDOWN_CHARS))
                .toBe(`before \\\\ after
before \\* after
\\- after
\\+ after
\\= after
\\=== after
\\\` after
\\~~~ after
before \\[ after
before \\] after
\\> after
before \\_ after
1\\. after
99\\. after`)
        })

        test('headings Markdown output is correct', () => {
            expect(markdownSerializer.serialize(HTML_INPUT_HEADINGS)).toBe(
                '# Heading level 1\n\n## Heading level 2\n\n### Heading level 3\n\n#### Heading level 4\n\n##### Heading level 5\n\n###### Heading level 6',
            )
        })

        test('paragraphs Markdown output is correct', () => {
            expect(markdownSerializer.serialize(HTML_INPUT_PARAGRAPHS)).toBe(
                `I really like using Markdown.

I think I'll use it to format all of my documents from now on.`,
            )
        })

        test('line breaks Markdown output is correct', () => {
            expect(markdownSerializer.serialize(HTML_INPUT_LINE_BREAKS))
                .toBe(`This is the first line.
And this is the second line.`)
        })

        test('styled text Markdown output is correct', () => {
            expect(markdownSerializer.serialize(HTML_INPUT_STYLED_TEXT)).toBe(
                `I just love **bold text**.
I just love **bold text**.

Italicized text is the _cat's meow_.
Italicized text is the _cat's meow_.

This text is _**really important**_.
This text is _**really important**_.
This text is **_really important_**.
This text is **_really important_**.
This is really _**very**_ important text.

Strikethrough uses two tildes: ~~scratch this~~`,
            )
        })

        test('blockquotes Markdown output is correct', () => {
            expect(markdownSerializer.serialize(HTML_INPUT_BLOCKQUOTES)).toBe(
                `> Dorothy followed her through many of the beautiful rooms in her castle.

> Dorothy followed her through many of the beautiful rooms in her castle.
>
> The Witch bade her clean the pots and kettles and sweep the floor and keep the fire fed with wood.

> Dorothy followed her through many of the beautiful rooms in her castle.
>
> > The Witch bade her clean the pots and kettles and sweep the floor and keep the fire fed with wood.

> #### The quarterly results look great!
>
> - Revenue was off the chart.
> - Profits were higher than ever.
>
> _Everything_ is going according to **plan**.`,
            )
        })

        test('ordered lists Markdown output is correct', () => {
            expect(markdownSerializer.serialize(HTML_INPUT_ORDERED_LISTS)).toBe(`1. First item
2. Second item
3. Third item
4. Fourth item

---

5. First item
6. Second item
7. Third item
8. Fourth item

---

1. First item
2. Second item
3. Third item
    1. Indented item
    2. Indented item
4. Fourth item`)
        })

        test('unordered lists Markdown output is correct', () => {
            expect(markdownSerializer.serialize(HTML_INPUT_UNORDERED_LISTS)).toBe(
                `- First item
- Second item
- Third item
- Fourth item

---

- First item
- Second item
- Third item
    - Indented item
    - Indented item
- Fourth item

---

- 1968\\. A great year!
- I think 1969 was second best.

---

- This is the first list item.
- Here's the second list item.
    I need to add another paragraph below the second list item.
- And here's the third list item.`,
            )
        })

        test('task lists syntax is ignored (unsupported by default)', () => {
            expect(markdownSerializer.serialize(HTML_INPUT_TASK_LISTS)).toBe(
                `-   First item
-   Second item
-   Third item
-   Fourth item

---

-   First item
-   Second item
-   Third item
-   Fourth item

---

-   First item
-   Second item
-   Third item
-   Fourth item

---

- First item
- Second item
- Third item
    -   Indented item
    -   Indented item
- Fourth item

---

-   1968\\. A great year!
-   I think 1969 was second best.

---

-   This is the first list item.
-   Here's the second list item.
    I need to add another paragraph below the second list item.
-   And here's the third list item.`,
            )
        })

        test('images Markdown output is correct', () => {
            expect(markdownSerializer.serialize(HTML_INPUT_IMAGES)).toBe(
                `![Tux, the Linux mascot](/assets/images/tux.png) ![Tux, the Linux mascot](/assets/images/tux.png "The Linux mascot") ![](data:image/gif;base64,NOT_SUPPORTED)

[![Tux, the Linux mascot](/assets/images/tux.png "The Linux mascot")](https://d33wubrfki0l68.cloudfront.net/e7ed9fe4bafe46e275c807d63591f85f9ab246ba/e2d28/assets/images/tux.png)`,
            )
        })

        test('code Markdown output is correct', () => {
            expect(markdownSerializer.serialize(HTML_INPUT_CODE)).toBe(
                `At the command prompt, type \`nano\`.

\`\`Use \`code\` in your Markdown file.\`\``,
            )
        })

        test('code block Markdown output is correct', () => {
            expect(markdownSerializer.serialize(HTML_INPUT_CODE_BLOCK)).toBe(
                `\`\`\`
<html>
  <head>
    <title>Test</title>
  </head>
</html>
\`\`\``,
            )
        })

        test('block elements Markdown output is correct', () => {
            expect(markdownSerializer.serialize(HTML_INPUT_INDENTED_BLOCK_ELEMENTS))
                .toBe(`1. Blockquote:

    > Dorothy followed her through many of the beautiful rooms in her castle.
2. Image:
    ![Tux, the Linux mascot](/assets/images/tux.png)
3. Codeblock:

    \`\`\`
    <html>
      <head>
        <title>Test</title>
      </head>
    </html>
    \`\`\``)
        })

        test('line rules Markdown output is correct', () => {
            expect(markdownSerializer.serialize(HTML_INPUT_LINE_RULES)).toBe(
                `---

---

---`,
            )
        })

        test('links Markdown output is correct', () => {
            expect(markdownSerializer.serialize(HTML_INPUT_LINKS)).toBe(
                `My favorite search engine is [Duck Duck Go](https://duckduckgo.com).
My favorite search engine is [Duck Duck Go](https://duckduckgo.com "The best search engine for privacy").`,
            )
        })

        test('styled links Markdown output is correct', () => {
            expect(markdownSerializer.serialize(HTML_INPUT_STYLED_LINKS)).toBe(
                `I love supporting the **[EFF](https://eff.org)**.
This is the _[Markdown Guide](https://www.markdownguide.org)_.
See the section on [\`code\`](#code).`,
            )
        })

        test('special Markdown characters are NOT escaped if `escape` is disabled', () => {
            const customSerializer = createMarkdownSerializer(getSchema([RichTextKit]), {
                escape: false,
            })
            expect(
                customSerializer.serialize(
                    `<p><strong>Wrapped markdown</strong> **still markdown**</p>`,
                ),
            ).toBe(`**Wrapped markdown** **still markdown**`)
        })

        describe('without `strike` extension', () => {
            test('strikethrough Markdown output is correct', () => {
                const customSerializer = createMarkdownSerializer(
                    getSchema([
                        RichTextKit.configure({
                            strike: false,
                        }),
                    ]),
                )

                expect(
                    customSerializer.serialize(
                        '<p>Strikethrough uses two tildes: <del>scratch this</del></p>',
                    ),
                ).toBe('Strikethrough uses two tildes: scratch this')
            })
        })

        describe('with custom `taskList` extension', () => {
            test('task lists HTML output is correct', () => {
                const customSerializer = createMarkdownSerializer(
                    getSchema([RichTextKit, TaskList, TaskItem]),
                )

                expect(customSerializer.serialize(HTML_INPUT_TASK_LISTS)).toBe(
                    `- [ ] First item
- [x] Second item
- [x] Third item
- [ ] Fourth item

---

- [x] First item
- [ ] Second item
- [ ] Third item
- [x] Fourth item

---

- [x] First item
- [ ] Second item
- [x] Third item
- [ ] Fourth item

---

- First item
- Second item
- Third item
    - [ ] Indented item
    - [ ] Indented item
- Fourth item

---

- [ ] 1968\\. A great year!
- [x] I think 1969 was second best.

---

- [ ] This is the first list item.
- [ ] Here's the second list item.
    I need to add another paragraph below the second list item.
- [ ] And here's the third list item.`,
                )
            })
        })

        describe('with custom `*Suggestion` extensions', () => {
            test('mention suggestion Markdown output is correct', () => {
                const customSerializer = createMarkdownSerializer(
                    getSchema([RichTextKit, createSuggestionExtension('mention')]),
                )

                expect(
                    customSerializer.serialize(
                        `<p>Question: Who&#39;s the head of the Frontend team?<br>Answer: <span data-mention data-id="963827" data-label="Henning M">@Henning M</span></p>`,
                    ),
                ).toBe(`Question: Who's the head of the Frontend team?
Answer: [Henning M](mention://963827)`)
            })

            test('channel suggestions Markdown output is correct', () => {
                const customSerializer = createMarkdownSerializer(
                    getSchema([RichTextKit, createSuggestionExtension('channel')]),
                )

                expect(
                    customSerializer.serialize(
                        `<p>Question: What&#39;s the best channel on Twist?<br>Answer: <span data-channel data-id="190200" data-label="Doist Frontend">#Doist Frontend</span></p>`,
                    ),
                ).toBe(`Question: What's the best channel on Twist?
Answer: [Doist Frontend](channel://190200)`)
            })
        })
    })
})
