import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { PappersService } from '../pappers/pappers.service';
import { pappersLookupTool, PappersToolInput } from './tools/pappers.tool';
import { EntrepriseData } from '../../types';

@Injectable()
export class ClaudeService {
  private anthropic: Anthropic;

  constructor(
    private configService: ConfigService,
    private pappersService: PappersService,
  ) {
    this.anthropic = new Anthropic({
      apiKey: this.configService.get<string>('anthropic.apiKey'),
    });
  }

  async lookupEntreprise(userInput: string): Promise<{
    entrepriseData: EntrepriseData | EntrepriseData[];
    claudeResponse: string;
  }> {
    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      tools: [pappersLookupTool],
      messages: [
        {
          role: 'user',
          content: `Recherche les informations de l'entreprise suivante pour remplir un formulaire DC1 de candidature aux marchés publics : "${userInput}".

        Si c'est un numéro à 14 chiffres, c'est un SIRET.
        Si c'est un numéro à 9 chiffres, c'est un SIREN.
        Sinon, recherche par nom d'entreprise.`,
        },
      ],
    });

    if (response.stop_reason === 'tool_use') {
      const toolUseBlock = response.content.find(
        (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use',
      );

      if (toolUseBlock && toolUseBlock.name === 'pappers_lookup') {
        const input = toolUseBlock.input as PappersToolInput;
        const result = await this.handlePappersLookup(input);

        const finalResponse = await this.anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          messages: [
            { role: 'user', content: `Recherche entreprise: ${userInput}` },
            { role: 'assistant', content: response.content },
            {
              role: 'user',
              content: [
                {
                  type: 'tool_result',
                  tool_use_id: toolUseBlock.id,
                  content: JSON.stringify(result),
                },
              ],
            },
          ],
        });

        const textBlock = finalResponse.content.find(
          (block): block is Anthropic.TextBlock => block.type === 'text',
        );

        return {
          entrepriseData: result,
          claudeResponse: textBlock?.text || 'Données récupérées avec succès.',
        };
      }
    }

    throw new HttpException(
      'Impossible de traiter la recherche',
      HttpStatus.BAD_REQUEST,
    );
  }

  private async handlePappersLookup(
    input: PappersToolInput,
  ): Promise<EntrepriseData | EntrepriseData[]> {
    switch (input.query_type) {
      case 'siret':
        return this.pappersService.lookupBySiret(input.query);
      case 'siren':
        return this.pappersService.lookupBySiren(input.query);
      case 'nom':
        return this.pappersService.searchByName(input.query);
      default:
        throw new HttpException(
          'Type de recherche invalide',
          HttpStatus.BAD_REQUEST,
        );
    }
  }
}
