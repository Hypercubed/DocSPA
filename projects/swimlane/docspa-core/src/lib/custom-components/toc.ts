import { Component, Input, OnInit, ViewEncapsulation, HostBinding, SimpleChanges } from '@angular/core';

import { of } from 'rxjs';
import { flatMap, map, share } from 'rxjs/operators';
import unified from 'unified';
import markdown from 'remark-parse';
import html from 'remark-html';
import toc from 'mdast-util-toc';
import visit from 'unist-util-visit';
import slug from 'remark-slug';

import { Page } from '../services/page.model';
import { FetchService } from '../services/fetch.service';
import { RouterService } from '../services/router.service';
import { LocationService } from '../services/location.service';

import { links, images } from '../plugins/links';
import frontmatter from 'remark-frontmatter';

@Component({
  selector: 'md-toc', // tslint:disable-line
  template: ``,
  encapsulation: ViewEncapsulation.None
})
export class TOCComponent implements OnInit {
  @Input()
  set path(val: string) {
    if (val !== this._path) {
      this._path = val;
      this.load(this.path);
    }
  }
  get path() {
    return this._path;
  }

  @Input()
  minDepth = 1;

  @Input()
  public maxDepth = 6;

  @Input()
  public tight = false;

  @HostBinding('innerHTML')
  html: string;

  private processor: any;
  private _path: string;

  constructor(
    private fetchService: FetchService,
    private routerService: RouterService,
    private locationService: LocationService
  ) {
    const toToc = () => {
      return (tree) => {
        const result = toc(tree, { maxDepth: this.maxDepth, tight: this.tight });
        tree.children = [].concat(
          tree.children.slice(0, result.index),
          result.map || []
        );
      };
    };

    const removeMinNodes = () => {
      return tree => {
        visit(tree, 'heading', (node, index, parent) => {
          if (node.depth < this.minDepth) {
            parent.children.splice(index, 1);
          }
        });
      };
    };

    this.processor = unified()
      .use(markdown)
      .use(frontmatter)
      .use(slug)
      .use(removeMinNodes)
      .use(toToc)
      .use(links, locationService)
      .use(images, locationService)
      .use(html);
  }

  ngOnInit() {
    if (!this.path) {
      this.path = this.routerService.file;
      this.routerService.changed.subscribe((changes: SimpleChanges) => {
        if ('contentPath' in changes) {
          this.path = changes.file.currentValue;
        }
      });
    } else {
      this.load(this.path);
    }
  }

  private load(path: string) {
    if (typeof path !== 'string' || path.trim() === '') {
      return of(null);
    }
    const url = this.locationService.makePath(path);
    this.fetchService.get(url)
      .pipe(
        flatMap(page => {
          const p = new Page({ ...page, path, contents: page.text });
          p.data = p.data || {};

          // hack until fetchService consumes vpage
          const initialPath = this.locationService.stripBaseHref(url);
          const base = this.locationService.fixPage(initialPath);

          page.resolvedPath = url;
          page.history = [base, initialPath];
          page.cwd = this.locationService.root;

          // TODO: might need to run plugins if headers change
          return page.notFound ? of('') : this.processor.process(p);
        }),
        map(String),
        share()
      ).subscribe(_ => {
        this.html = _;
      });
  }
}
