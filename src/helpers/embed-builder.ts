/**
 * Builder class for constructing embed objects for `stoat.js`.
 *
 * This class uses the builder pattern to construct embed objects with method chaining.
 * All setter methods return `this` to allow chaining calls together.
 *
 * @example
 * ```typescript
 * const embed = new EmbedBuilder()
 *   .setTitle("Hello World")
 *   .setDescription("This is an embed")
 *   .setColour("#FF5733")
 *   .build();
 * ```
 */
export class EmbedBuilder {
  private iconUrl: string | null = null;
  private url: string | null = null;
  private title: string | null = null;
  private description: string | null = null;
  private media: string | null = null;
  private colour: string | null = null;

  /**
   * Sets the icon URL for the embed
   * @param iconUrl - The URL of the icon, or null to clear it
   * @returns The builder instance for method chaining
   */
  setIconUrl(iconUrl: string | null): this {
    this.iconUrl = iconUrl;
    return this;
  }

  /**
   * Sets the URL for the embed
   * @param url - The URL, or null to clear it
   * @returns The builder instance for method chaining
   */
  setUrl(url: string | null): this {
    this.url = url;
    return this;
  }

  /**
   * Sets the title of the embed
   * @param title - The title text, or null to clear it
   * @returns The builder instance for method chaining
   */
  setTitle(title: string | null): this {
    this.title = title;
    return this;
  }

  /**
   * Sets the description of the embed
   * @param description - The description text, or null to clear it
   * @returns The builder instance for method chaining
   */
  setDescription(description: string | null): this {
    this.description = description;
    return this;
  }

  /**
   * Sets the media URL for the embed
   * @param media - The media URL, or null to clear it
   * @returns The builder instance for method chaining
   */
  setMedia(media: string | null): this {
    this.media = media;
    return this;
  }

  /**
   * Sets the colour of the embed
   * @param colour - The colour as a hex string or null to clear it
   * @returns The builder instance for method chaining
   */
  setColour(colour: string | null): this {
    this.colour = colour;
    return this;
  }

  /**
   * Builds and returns the final embed object
   * @returns An embed object with all configured properties
   */
  build(): {
    icon_url: string | null;
    url: string | null;
    title: string | null;
    description: string | null;
    media: string | null;
    colour: string | null;
  } {
    return {
      icon_url: this.iconUrl,
      url: this.url,
      title: this.title,
      description: this.description,
      media: this.media,
      colour: this.colour,
    };
  }
}
