---
mode: agent
---

Your job is to create PR.
In order to do that, follow these steps:

- Check current branch in case it's master or main - create a new branch if needed
- Verify everything is committed
- Run verification commands
  - `npm run type-check`
  - `npm run lint`
  - `npm run test`
  - `npm run build`
- Check the diff of the files that were changed vs master
- Understand the context of the changes
- Push changes to external branch if needed
- Create PR with description of changes (use mcp with github to create PR)
