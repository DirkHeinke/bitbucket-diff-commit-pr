// ==UserScript==
// @name        bitbucket-diff-commit-pr
// @description Diff commits in Bitbucket Cloud PRs.
// @namespace   http://dirkheinke.de
// @include     https://bitbucket.org/*/pull-requests/*
// @version     1.0.0
// @author      Dirk Heinke
// @license     MIT
// @grant       none
// ==/UserScript==

/*
MIT License

Copyright (c) 2020 cvzi

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/* globals React, ReactDOM */
(function () {
    'use strict';

    class BbPrDiff {
        constructor() {
            console.log("Starting BbPrDiff");
            const body = document.documentElement || document.body;
            const observer = new MutationObserver(this.domChanged.bind(this));
            observer.observe(body, {
                attributes: true,
                childList: true,
                subtree: true,
            });
        }
        domChanged(mutationsList, observer) {
            for (const mutation of mutationsList) {
                const addedCommitBlocks = this.findAddedCommitBlocks(mutation);
                addedCommitBlocks.forEach((block) => {
                    console.log("new commit block", block);
                    this.addCheckboxToCommitBlock(block);
                });
                const addedCommitTable = this.findAddedCommitTable(mutation);
                if (addedCommitTable) {
                    console.log("new commit table", addedCommitTable);
                    this.addCompareButtonToCommitTable(addedCommitTable);
                }
            }
        }
        findAddedCommitTable(mutation) {
            let commitTable = undefined;
            mutation.addedNodes.forEach((added) => {
                if (added instanceof HTMLElement) {
                    // rows in table with aria-label="commit-list"
                    const commitTableQuery = added.querySelector("[aria-label='Commit list'] table")?.parentElement;
                    if (commitTableQuery) {
                        console.log("commitTableQuery", commitTableQuery);
                        commitTable = commitTableQuery;
                    }
                }
            });
            return commitTable;
        }
        findAddedCommitBlocks(mutation) {
            const commitBlockList = [];
            mutation.addedNodes.forEach((added) => {
                if (added instanceof HTMLElement) {
                    // rows in table with aria-label="commit-list"
                    const commitTr = added.querySelectorAll("[aria-label='Commit list'] tbody tr");
                    if (commitTr.length > 0) {
                        console.log("commitTr", commitTr);
                        commitBlockList.push(...Array.from(commitTr));
                    }
                }
            });
            return commitBlockList;
        }
        addCheckboxToCommitBlock(block) {
            // get commit id
            const commitId = block.querySelector("[data-qa^='commit-hash-wrapper']").innerText;
            // add checkbox
            const td = document.createElement("td");
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = commitId;
            checkbox.style.width = "50px";
            checkbox.style.textAlign = "center";
            checkbox.style.userSelect = "none";
            td.append(checkbox);
            block.append(td);
        }
        addCompareButtonToCommitTable(block) {
            // add compare button
            const button = document.createElement("button");
            button.innerText = "Compare";
            button.style.textAlign = "center";
            button.style.userSelect = "none";
            button.addEventListener("click", (e) => {
                e.stopPropagation();
                this.openComparePage();
            });
            block.append(button);
        }
        getCommitIds() {
            const commitIds = [];
            document
                .querySelectorAll("input[type='checkbox']:checked")
                .forEach((checkbox) => {
                commitIds.push(checkbox.value);
            });
            if (commitIds.length != 2) {
                alert("Please select 2 commits to compare");
                return [];
            }
            return commitIds;
        }
        getCompareUrl(commitIds) {
            const compareUrl = window.location.origin +
                window.location.pathname.substring(0, window.location.pathname.indexOf("pull-request")) +
                "/branches/compare/";
            const commitIdsString = commitIds.join("%0D");
            return compareUrl + commitIdsString + "#diff";
        }
        openComparePage() {
            const commitIds = this.getCommitIds();
            if (commitIds.length != 2)
                return;
            const url = this.getCompareUrl(commitIds);
            window.open(url, "_blank");
        }
    }

    (function () {

      new BbPrDiff();
    })();

})();
//# sourceMappingURL=bundle.user.js.map
