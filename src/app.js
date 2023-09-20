import algoliasearch from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';
import {
  configure,
  hits,
  pagination,
  panel,
  refinementList,
  searchBox,
} from 'instantsearch.js/es/widgets';

const searchClient = algoliasearch(
  '950FKJKDEB',
  'a751cfb6edbb86ff4f5f3416b51253c0',
);

const search = instantsearch({
  indexName: 'prod_freepythoncourse',
  searchClient,
});

async function displayFirstAvailableImage(imgElement, imageUrl) {
  const imageUrls = [
    imageUrl.replace('{size}', '40').replace(".jpg", ".png"),
    imageUrl.replace('{size}', '40').replace(".png", ".jpg"),
    imageUrl.replace('{size}', '25').replace(".jpg", ".png"),
    imageUrl.replace('{size}', '25').replace(".png", ".jpg"),
  ];
  
  for (let i = 0; i < imageUrls.length; i++) {
    try {
      const response = await fetch(imageUrls[i], { method: 'HEAD' });

      if (response.ok) {
        imgElement.src = imageUrls[i];
        return;
      }
    } catch (error) {}
  }

  imgElement.remove();
}

const observer = new MutationObserver((mutationsList) => {
  for(const mutation of mutationsList) {
    if(mutation.addedNodes.length) {
      mutation.addedNodes.forEach((node) => {
        if(node.querySelectorAll) {
          const imgElements = node.querySelectorAll('.search-hit-avatar');
          imgElements.forEach(imgElement => {
            const imageUrl = imgElement.getAttribute('data-img');
            displayFirstAvailableImage(imgElement, imageUrl);
          });
        }
      });
    }
  }
});

observer.observe(document.body, { childList: true, subtree: true });

search.addWidgets([
  searchBox({
    container: '#searchbox',
  }),
  hits({
    container: '#hits',
    templates: {
      item: (hit, { html, components }) => html`
        <article class="search-hit">
          <header class="search-hit-header">
            <img src="letter_avatar_proxy/v4/letter/o/5f8ce5.png" data-img="https://forums.pythonic.guru${hit.avatar_template}" alt="${hit.display_username}'s avatar" class="search-hit-avatar" />
            <div class="search-hit-info">
              <h2 class="search-hit-title">
                <a href="${hit.url}" class="search-hit-link">
                  ${components.Highlight({ hit, attribute: 'topic_title' })}
                </a>
              </h2>
              <p class="search-hit-meta">
                ${ hit.display_username && html`פורסם על־ידי ${hit.display_username} ` }
                בתאריך ${hit.created_at}
              </p>
            </div>
          </header>
          <section class="search-hit-content">
            <p class="search-hit-text">${components.Snippet({ hit, attribute: 'cooked' })}</p>
          </section>
          <footer class="search-hit-footer">
            <div class="search-hit-category">קטגוריה: ${hit.category_name}</div>
            ${ hit.tags.length > 0 && html`
              <div class="search-hit-tags">תגיות: ${" "} ${
                hit.tags.map((t, index) => html`
                  <a class="tag-link" href="https://forums.pythonic.guru/t/${t}.html">${t}</a>
                  ${index < hit.tags.length - 1 ? ',\u0020' : ''}`)}
              </div>
            `}
            <div class="search-hit-read-more">
              <a href="${hit.url}" class="search-hit-link">לפורום</a>
            </div>
          </footer>
        </article>
      `,
    },
  }),
  configure({
    hitsPerPage: 8,
  }),
  panel({
    templates: { header: "תגיות" },
  })(refinementList)({
    container: '#tags-list',
    attribute: 'tags',
  }),
  panel({
    templates: { header: "קטגוריות" },
  })(refinementList)({
    container: '#category_name-list',
    attribute: 'category_name',
  }),
  pagination({
    container: '#pagination',
  }),
]);

search.start();
