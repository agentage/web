#!/usr/bin/env node

/**
 * Migration Script: Add MCP Server Support to Agents
 * 
 * This script migrates the agents and agent_versions collections to support:
 * - contentType field
 * - mcpServers field
 * - agentVersion field
 * - tools field
 * - sections field
 * 
 * Usage:
 *   MONGODB_URI=<your-uri> node scripts/migrate-agents-mcp.js
 */

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI environment variable is required');
  process.exit(1);
}

async function migrate() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    const agentsCollection = db.collection('agents');
    const versionsCollection = db.collection('agent_versions');

    // 1. Add indexes
    console.log('\n1. Creating indexes...');
    
    try {
      await agentsCollection.createIndex({ contentType: 1 });
      console.log('   - Created index on agents.contentType');
    } catch (error) {
      console.log('   - Index on agents.contentType already exists');
    }

    try {
      await agentsCollection.createIndex({ 'mcpServers': 1 }, { sparse: true });
      console.log('   - Created sparse index on agents.mcpServers');
    } catch (error) {
      console.log('   - Index on agents.mcpServers already exists');
    }

    // 2. Update existing agents
    console.log('\n2. Updating agents collection...');
    
    const agentsCount = await agentsCollection.countDocuments();
    console.log(`   - Found ${agentsCount} agents`);

    // Set contentType='plain' for agents without contentType
    const updateResult = await agentsCollection.updateMany(
      { contentType: { $exists: false } },
      { $set: { contentType: 'plain' } }
    );
    console.log(`   - Set contentType='plain' for ${updateResult.modifiedCount} agents`);

    // 3. Update existing agent versions
    console.log('\n3. Updating agent_versions collection...');
    
    const versionsCount = await versionsCollection.countDocuments();
    console.log(`   - Found ${versionsCount} versions`);

    const versionUpdateResult = await versionsCollection.updateMany(
      { contentType: { $exists: false } },
      { $set: { contentType: 'plain' } }
    );
    console.log(`   - Set contentType='plain' for ${versionUpdateResult.modifiedCount} versions`);

    // 4. Attempt to parse markdown agents
    console.log('\n4. Attempting to parse markdown agents...');
    
    const markdownAgents = await agentsCollection.find({
      latestContent: { $regex: /^---\s*\n/ }
    }).toArray();

    console.log(`   - Found ${markdownAgents.length} potential markdown agents`);

    for (const agent of markdownAgents) {
      try {
        // Simple check - if content starts with ---, it might be markdown
        if (agent.latestContent.trimStart().startsWith('---')) {
          await agentsCollection.updateOne(
            { _id: agent._id },
            { $set: { contentType: 'markdown' } }
          );
          console.log(`   - Marked agent ${agent.name} as markdown`);
        }
      } catch (error) {
        console.log(`   - Failed to process agent ${agent.name}: ${error.message}`);
      }
    }

    // 5. Update versions for markdown agents
    console.log('\n5. Updating versions for markdown agents...');
    
    const markdownAgentIds = markdownAgents.map(a => a._id);
    if (markdownAgentIds.length > 0) {
      const versionMarkdownUpdateResult = await versionsCollection.updateMany(
        { 
          agentId: { $in: markdownAgentIds },
          content: { $regex: /^---\s*\n/ }
        },
        { $set: { contentType: 'markdown' } }
      );
      console.log(`   - Updated ${versionMarkdownUpdateResult.modifiedCount} versions to markdown`);
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\nSummary:');
    console.log(`   - Total agents: ${agentsCount}`);
    console.log(`   - Total versions: ${versionsCount}`);
    console.log(`   - Markdown agents detected: ${markdownAgents.length}`);
    console.log('\nNote: Frontmatter parsing will happen automatically when agents are accessed.');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run migration
migrate().catch(console.error);
