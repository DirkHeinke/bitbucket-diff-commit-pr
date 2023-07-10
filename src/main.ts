export class BbPrDiff {
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

  domChanged(mutationsList: MutationRecord[], observer: MutationObserver) {
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

  private findAddedCommitTable(mutation: MutationRecord) {
    let commitTable: HTMLElement | undefined = undefined;
    mutation.addedNodes.forEach((added) => {
      if (added instanceof HTMLElement) {
        // rows in table with aria-label="commit-list"
        const commitTableQuery = added.querySelector<HTMLElement>(
          "[aria-label='Commit list'] table"
        )?.parentElement;

        if (commitTableQuery) {
          console.log("commitTableQuery", commitTableQuery);
          commitTable = commitTableQuery;
        }
      }
    });

    return commitTable;
  }

  private findAddedCommitBlocks(mutation: MutationRecord) {
    const commitBlockList: HTMLElement[] = [];
    mutation.addedNodes.forEach((added) => {
      if (added instanceof HTMLElement) {
        // rows in table with aria-label="commit-list"
        const commitTr = added.querySelectorAll<HTMLElement>(
          "[aria-label='Commit list'] tbody tr"
        );

        if (commitTr.length > 0) {
          console.log("commitTr", commitTr);
          commitBlockList.push(...Array.from(commitTr));
        }
      }
    });

    return commitBlockList;
  }

  private addCheckboxToCommitBlock(block: HTMLElement) {
    // get commit id
    const commitId = block.querySelector<HTMLElement | null>(
      "[data-qa^='commit-hash-wrapper']"
    ).innerText;

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

  private addCompareButtonToCommitTable(block: HTMLElement) {
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

  private getCommitIds(): string[] {
    const commitIds: string[] = [];
    document
      .querySelectorAll<HTMLInputElement>("input[type='checkbox']:checked")
      .forEach((checkbox) => {
        commitIds.push(checkbox.value);
      });

    if (commitIds.length != 2) {
      alert("Please select 2 commits to compare");
      return [];
    }

    return commitIds;
  }

  private getCompareUrl(commitIds: string[]): string {
    const compareUrl =
      window.location.origin +
      window.location.pathname.substring(
        0,
        window.location.pathname.indexOf("pull-request")
      ) +
      "/branches/compare/";
    const commitIdsString = commitIds.join("%0D");
    return compareUrl + commitIdsString + "#diff";
  }

  private openComparePage() {
    const commitIds = this.getCommitIds();
    if (commitIds.length != 2) return;
    const url = this.getCompareUrl(commitIds);
    window.open(url, "_blank");
  }
}
