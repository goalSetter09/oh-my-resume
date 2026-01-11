#!/usr/bin/env node

import { existsSync, mkdirSync, writeFileSync } from "fs"
import { homedir } from "os"
import { join } from "path"

const DEFAULT_CONFIG = {
  $schema: "https://raw.githubusercontent.com/goalSetter09/oh-my-resume/main/assets/oh-my-resume.schema.json",
  agents: {
    "interview-prep": {
      model: "anthropic/claude-sonnet-4-5",
    },
  },
}

function getConfigPath(): string {
  const configDir = join(homedir(), ".config", "opencode")
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true })
  }
  return join(configDir, "oh-my-resume.json")
}

function install(): void {
  const configPath = getConfigPath()

  if (existsSync(configPath)) {
    console.log(`⚠️  Config already exists: ${configPath}`)
    console.log("   To reinstall, delete the file first.")
    return
  }

  writeFileSync(configPath, JSON.stringify(DEFAULT_CONFIG, null, 2))
  console.log("✅ oh-my-resume installed successfully!")
  console.log(`   Config created: ${configPath}`)
  console.log("")
  console.log("📝 Next steps:")
  console.log("   1. Add 'oh-my-resume' to your opencode.json plugins")
  console.log("   2. Customize agents in oh-my-resume.json if needed")
  console.log("")
  console.log("Example opencode.json:")
  console.log('   { "plugin": ["oh-my-resume"] }')
}

function showHelp(): void {
  console.log(`
oh-my-resume - AI-Powered Interview Preparation Agent System

Usage:
  oh-my-resume install    Create default config file
  oh-my-resume --help     Show this help message

Commands:
  install    Generate oh-my-resume.json in ~/.config/opencode/
`)
}

const command = process.argv[2]

switch (command) {
  case "install":
    install()
    break
  case "--help":
  case "-h":
  case undefined:
    showHelp()
    break
  default:
    console.error(`Unknown command: ${command}`)
    showHelp()
    process.exit(1)
}
